import secrets
import os
import logging

COLORS = {
    "DEBUG": "\033[36m",
    "INFO": "\033[32m",
    "WARNING": "\033[33m",
    "ERROR": "\033[31m",
    "CRITICAL": "\033[41m",
}
RESET = "\033[0m"


class ColorFormatter(logging.Formatter):
    def format(self, record):
        log_color = COLORS.get(record.levelname, "")
        message = super().format(record)
        return f"{log_color}{message}{RESET}"


logger = logging.getLogger("secret_generator")
handler = logging.StreamHandler()
handler.setFormatter(ColorFormatter("%(asctime)s - %(levelname)s - %(message)s"))
logger.addHandler(handler)
logger.setLevel(logging.INFO)

if __name__ == "__main__":
    if not os.path.exists(".env"):
        logger.warning(".env file not found. Generating a new SECRET_KEY.")
        with open(".env", "w") as f:
            secret_key = secrets.token_bytes(32).hex()
            f.write(f"SECRET_KEY={secret_key}\nDEV=False")
            logger.info("Generated .env file with SECRET_KEY.")
    else:
        logger.warning(".env file already exists. No action taken.")
