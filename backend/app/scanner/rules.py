import ast


class VulnerabilityScanner(ast.NodeVisitor):
    """
    Walks through a Python AST (Abstract Syntax Tree) and detects
    security vulnerabilities based on predefined rules.
    """

    def __init__(self):
        self.vulnerabilities = []

    def _add_vuln(self, line, severity, title, description, cwe=""):
        """Helper to record a found vulnerability."""
        self.vulnerabilities.append({
            "line": line,
            "severity": severity,
            "title": title,
            "description": description,
            "cwe": cwe,
        })

    def visit_Call(self, node):
        """Detect dangerous function calls."""

        func_name = ""
        if isinstance(node.func, ast.Name):
            func_name = node.func.id
        elif isinstance(node.func, ast.Attribute):
            func_name = node.func.attr

        # Rule 1: eval() — arbitrary code execution
        if func_name == "eval":
            self._add_vuln(
                node.lineno, "CRITICAL",
                "Use of eval()",
                "eval() executes arbitrary code. An attacker can inject "
                "malicious Python code through user input.",
                "CWE-95",
            )

        # Rule 2: exec() — arbitrary code execution
        if func_name == "exec":
            self._add_vuln(
                node.lineno, "CRITICAL",
                "Use of exec()",
                "exec() executes arbitrary code strings. Never use with "
                "untrusted input.",
                "CWE-95",
            )

        # Rule 3: compile() — can be used to execute arbitrary code
        if func_name == "compile":
            self._add_vuln(
                node.lineno, "HIGH",
                "Use of compile()",
                "compile() can be used to dynamically create and execute "
                "code. Avoid with untrusted input.",
                "CWE-95",
            )

        # Rule 4: os.system() — command injection
        if func_name == "system":
            self._add_vuln(
                node.lineno, "HIGH",
                "Use of os.system()",
                "os.system() is vulnerable to command injection. "
                "Use subprocess.run() with shell=False instead.",
                "CWE-78",
            )

        # Rule 5: subprocess with shell=True
        if func_name in ("call", "run", "Popen", "check_output"):
            for keyword in node.keywords:
                if keyword.arg == "shell" and isinstance(keyword.value, ast.Constant):
                    if keyword.value.value is True:
                        self._add_vuln(
                            node.lineno, "HIGH",
                            "subprocess with shell=True",
                            "Using shell=True opens the door to shell "
                            "injection attacks.",
                            "CWE-78",
                        )

        # Rule 6: SQL Injection — raw string formatting in queries
        if func_name in ("execute", "executemany"):
            for arg in node.args:
                if isinstance(arg, ast.JoinedStr):  # f-string
                    self._add_vuln(
                        node.lineno, "CRITICAL",
                        "Potential SQL Injection",
                        "Using f-strings or string formatting in SQL queries "
                        "allows SQL injection. Use parameterized queries.",
                        "CWE-89",
                    )
                if isinstance(arg, ast.BinOp) and isinstance(arg.op, ast.Mod):
                    self._add_vuln(
                        node.lineno, "CRITICAL",
                        "Potential SQL Injection",
                        "Using % string formatting in SQL queries allows "
                        "SQL injection. Use parameterized queries.",
                        "CWE-89",
                    )

        # Rule 7: yaml.load() without SafeLoader
        if func_name == "load":
            if isinstance(node.func, ast.Attribute):
                has_safe_loader = False
                for keyword in node.keywords:
                    if keyword.arg == "Loader":
                        has_safe_loader = True
                if not has_safe_loader and len(node.args) <= 1:
                    self._add_vuln(
                        node.lineno, "HIGH",
                        "Unsafe YAML loading",
                        "yaml.load() without Loader=SafeLoader can execute "
                        "arbitrary code. Use yaml.safe_load() instead.",
                        "CWE-502",
                    )

        # Rule 8: Weak hashing algorithms
        if func_name in ("md5", "sha1"):
            self._add_vuln(
                node.lineno, "MEDIUM",
                f"Weak hash algorithm: {func_name}",
                f"{func_name} is cryptographically weak and vulnerable to "
                f"collision attacks. Use SHA-256 or bcrypt instead.",
                "CWE-328",
            )

        # Rule 9: Flask/Django debug mode
        if func_name == "run":
            for keyword in node.keywords:
                if keyword.arg == "debug" and isinstance(keyword.value, ast.Constant):
                    if keyword.value.value is True:
                        self._add_vuln(
                            node.lineno, "MEDIUM",
                            "Debug mode enabled",
                            "Running with debug=True in production exposes "
                            "sensitive info and allows code execution.",
                            "CWE-215",
                        )

        # Rule 10: Requests without SSL verification
        if func_name in ("get", "post", "put", "delete", "patch"):
            for keyword in node.keywords:
                if keyword.arg == "verify" and isinstance(keyword.value, ast.Constant):
                    if keyword.value.value is False:
                        self._add_vuln(
                            node.lineno, "HIGH",
                            "SSL verification disabled",
                            "Setting verify=False disables SSL certificate "
                            "checking, allowing man-in-the-middle attacks.",
                            "CWE-295",
                        )

        self.generic_visit(node)

    def visit_Import(self, node):
        """Detect imports of dangerous modules."""
        dangerous = {
            "pickle": "pickle can execute arbitrary code during deserialization. Use json instead.",
            "marshal": "marshal can execute arbitrary code. Use json instead.",
            "shelve": "shelve uses pickle internally and is unsafe with untrusted data.",
            "telnetlib": "telnetlib sends data in plaintext. Use SSH instead.",
        }
        for alias in node.names:
            if alias.name in dangerous:
                self._add_vuln(
                    node.lineno, "MEDIUM",
                    f"Import of {alias.name}",
                    dangerous[alias.name],
                    "CWE-502",
                )
        self.generic_visit(node)

    def visit_ImportFrom(self, node):
        """Detect dangerous from-imports."""
        if node.module and "pickle" in node.module:
            self._add_vuln(
                node.lineno, "MEDIUM",
                "Import from pickle",
                "pickle can execute arbitrary code during deserialization.",
                "CWE-502",
            )
        self.generic_visit(node)

    def visit_Assign(self, node):
        """Detect hardcoded secrets."""
        secret_keywords = {
            "password", "secret", "api_key", "token", "passwd",
            "private_key", "access_key", "secret_key", "auth_token",
            "db_password", "database_url",
        }

        for target in node.targets:
            if isinstance(target, ast.Name):
                var_name = target.id.lower()
                if any(kw in var_name for kw in secret_keywords):
                    if isinstance(node.value, ast.Constant) and isinstance(
                        node.value.value, str
                    ):
                        self._add_vuln(
                            node.lineno, "HIGH",
                            "Hardcoded secret detected",
                            f"Variable '{target.id}' contains a hardcoded "
                            f"secret. Use environment variables instead.",
                            "CWE-798",
                        )
        self.generic_visit(node)

    def visit_ExceptHandler(self, node):
        """Detect bare except clauses that catch everything."""
        if node.type is None:
            self._add_vuln(
                node.lineno, "LOW",
                "Bare except clause",
                "Using 'except:' without specifying an exception type "
                "catches all errors including KeyboardInterrupt and "
                "SystemExit. This can hide bugs and security issues.",
                "CWE-396",
            )
        self.generic_visit(node)


def scan_code(source_code: str) -> list[dict]:
    """
    Main entry point: takes Python source code as a string,
    parses it into an AST, scans it, and returns vulnerabilities.
    """
    try:
        tree = ast.parse(source_code)
    except SyntaxError as e:
        return [{"line": e.lineno, "severity": "ERROR",
                 "title": "Syntax Error", "description": str(e.msg),
                 "cwe": ""}]

    scanner = VulnerabilityScanner()
    scanner.visit(tree)
    return scanner.vulnerabilities