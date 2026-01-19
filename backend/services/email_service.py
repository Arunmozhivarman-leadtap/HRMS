import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from backend.core.config import settings
import logging

logger = logging.getLogger(__name__)

class EmailService:
    def send_email(self, to_email: str, subject: str, body: str, is_html: bool = False):
        if not settings.SMTP_SERVER or not settings.SMTP_USER:
            logger.warning(f"Email not sent to {to_email} because SMTP is not configured.")
            logger.info(f"Subject: {subject}\nBody: {body}")
            return

        msg = MIMEMultipart()
        msg['From'] = settings.SMTP_FROM_EMAIL
        msg['To'] = to_email
        msg['Subject'] = subject

        msg.attach(MIMEText(body, 'html' if is_html else 'plain'))

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
