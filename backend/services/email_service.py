import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from core.config import settings
import logging

logger = logging.getLogger(__name__)

class EmailService:
    def send_email(self, to_email: str, subject: str, body: str, is_html: bool = False, attachments: list[str] = None):
        if not settings.SMTP_SERVER or not settings.SMTP_USER:
            logger.warning(f"Email not sent to {to_email} because SMTP is not configured.")
            logger.info(f"Subject: {subject}\nBody: {body}")
            if attachments:
                 logger.info(f"Attachments: {attachments}")
            return

        msg = MIMEMultipart()
        msg['From'] = settings.SMTP_FROM_EMAIL
        msg['To'] = to_email
        msg['Subject'] = subject

        msg.attach(MIMEText(body, 'html' if is_html else 'plain'))

        if attachments:
            import os
            from email.mime.application import MIMEApplication
            
            for file_path in attachments:
                try:
                    with open(file_path, "rb") as f:
                        part = MIMEApplication(f.read(), Name=os.path.basename(file_path))
                    # After the file is closed
                    part['Content-Disposition'] = f'attachment; filename="{os.path.basename(file_path)}"'
                    msg.attach(part)
                except Exception as e:
                    logger.error(f"Failed to attach file {file_path}: {e}")

        try:
            server = smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT)
            if settings.SMTP_TLS:
                server.starttls()
            
            if settings.SMTP_USER and settings.SMTP_PASSWORD:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            
            server.send_message(msg)
            server.quit()
            logger.info(f"Email sent to {to_email}")
        except Exception as e:
            logger.error(f"Failed to send email: {str(e)}")
            # In production, might want to re-raise or use a task queue
            pass

email_service = EmailService()
