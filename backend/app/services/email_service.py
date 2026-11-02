from typing import List, Optional
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from jinja2 import Template
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)


class EmailService:
    """Service for handling email operations using FastAPI-mail"""

    _mail_config: Optional[ConnectionConfig] = None
    _fast_mail: Optional[FastMail] = None

    @classmethod
    def _get_mail_config(cls) -> ConnectionConfig:
        """Get or create mail configuration"""
        if cls._mail_config is None:
            cls._mail_config = ConnectionConfig(
                MAIL_USERNAME=settings.smtp_username,
                MAIL_PASSWORD=settings.smtp_password,
                MAIL_FROM=settings.smtp_from_email,
                MAIL_FROM_NAME=settings.smtp_from_name,
                MAIL_SERVER=settings.smtp_server,
                MAIL_PORT=settings.smtp_port,
                MAIL_STARTTLS=settings.smtp_use_tls,
                MAIL_SSL_TLS=False,
                USE_CREDENTIALS=True,
                VALIDATE_CERTS=True,
            )
        return cls._mail_config

    @classmethod
    def _get_fast_mail(cls) -> FastMail:
        """Get or create FastMail instance"""
        if cls._fast_mail is None:
            cls._fast_mail = FastMail(cls._get_mail_config())
        return cls._fast_mail

    @staticmethod
    async def send_job_notification_email(
        recipient_email: str,
        student_name: str,
        job_title: str,
        company_name: str,
        job_description: str,
        salary_lpa: float,
        application_deadline: str,
        job_location: str,
    ) -> bool:
        """
        Send email notification to student when a new job is posted

        Args:
            recipient_email: Student's email address
            student_name: Name of the student
            job_title: Title of the job posted
            company_name: Name of the company
            job_description: Description of the job
            salary_lpa: Salary in LPA
            application_deadline: Application deadline date
            job_location: Location of the job

        Returns:
            bool: True if email sent successfully, False otherwise
        """
        if not settings.enable_email:
            logger.info(f"Email service disabled. Skipping job notification for {recipient_email}")
            return False

        try:
            html_content = f"""
            <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #2c3e50;">New Job Opportunity for You! 🎯</h2>
                        
                        <p>Dear {student_name},</p>
                        
                        <p>Great news! A new job matching your profile has been posted on CampusHire:</p>
                        
                        <div style="background-color: #f8f9fa; padding: 20px; border-left: 4px solid #007bff; margin: 20px 0;">
                            <p><strong>Job Title:</strong> {job_title}</p>
                            <p><strong>Company:</strong> {company_name}</p>
                            <p><strong>Location:</strong> {job_location}</p>
                            <p><strong>Salary:</strong> ₹{salary_lpa} LPA</p>
                            <p><strong>Application Deadline:</strong> {application_deadline}</p>
                        </div>
                        
                        <h3 style="color: #2c3e50;">Job Description:</h3>
                        <p>{job_description[:500]}...</p>
                        
                        <p style="margin-top: 30px;">
                            <a href="https://campushire.com/jobs" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                                View Full Job Details
                            </a>
                        </p>
                        
                        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
                        
                        <p style="color: #666; font-size: 12px;">
                            This is an automated email from CampusHire. Please do not reply to this email.
                        </p>
                    </div>
                </body>
            </html>
            """

            message = MessageSchema(
                subject=f"New Job Opportunity: {job_title} at {company_name}",
                recipients=[recipient_email],
                html=html_content,
                subtype="html",
            )

            fast_mail = EmailService._get_fast_mail()
            await fast_mail.send_message(message)
            logger.info(f"Job notification email sent to {recipient_email}")
            return True

        except Exception as e:
            logger.error(f"Failed to send job notification email to {recipient_email}: {str(e)}")
            return False

    @staticmethod
    async def send_offer_notification_email(
        recipient_email: str,
        student_name: str,
        job_title: str,
        company_name: str,
        salary_lpa: float,
        offer_status: str,
    ) -> bool:
        """
        Send email notification to student when an offer letter is received

        Args:
            recipient_email: Student's email address
            student_name: Name of the student
            job_title: Title of the position
            company_name: Name of the company
            salary_lpa: Salary in LPA
            offer_status: Status of the offer (PENDING, ACCEPTED, REJECTED)

        Returns:
            bool: True if email sent successfully, False otherwise
        """
        if not settings.enable_email:
            logger.info(f"Email service disabled. Skipping offer notification for {recipient_email}")
            return False

        try:
            status_color = {
                "PENDING": "#ff9800",
                "ACCEPTED": "#4caf50",
                "REJECTED": "#f44336",
            }.get(offer_status, "#2196f3")

            html_content = f"""
            <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #2c3e50;">Congratulations! You Have Received an Offer! 🎉</h2>
                        
                        <p>Dear {student_name},</p>
                        
                        <p>We are excited to inform you that you have received an offer from {company_name}!</p>
                        
                        <div style="background-color: #f8f9fa; padding: 20px; border-left: 4px solid {status_color}; margin: 20px 0;">
                            <p><strong>Position:</strong> {job_title}</p>
                            <p><strong>Company:</strong> {company_name}</p>
                            <p><strong>Salary:</strong> ₹{salary_lpa} LPA</p>
                            <p><strong>Offer Status:</strong> <span style="color: {status_color}; font-weight: bold;">{offer_status}</span></p>
                        </div>
                        
                        <p style="margin-top: 20px;">
                            Please log in to your CampusHire account to view the complete offer letter and take necessary actions.
                        </p>
                        
                        <p style="margin-top: 30px;">
                            <a href="https://campushire.com/offers" style="background-color: #4caf50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                                View Offer Details
                            </a>
                        </p>
                        
                        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
                        
                        <p style="color: #666; font-size: 12px;">
                            This is an automated email from CampusHire. Please do not reply to this email.
                        </p>
                    </div>
                </body>
            </html>
            """

            message = MessageSchema(
                subject=f"Offer Letter Received: {job_title} at {company_name}",
                recipients=[recipient_email],
                html=html_content,
                subtype="html",
            )

            fast_mail = EmailService._get_fast_mail()
            await fast_mail.send_message(message)
            logger.info(f"Offer notification email sent to {recipient_email}")
            return True

        except Exception as e:
            logger.error(f"Failed to send offer notification email to {recipient_email}: {str(e)}")
            return False

    @staticmethod
    async def send_bulk_job_notification(
        job_id: str,
        job_title: str,
        company_name: str,
        job_description: str,
        salary_lpa: float,
        application_deadline: str,
        job_location: str,
        eligible_students: List[dict],
    ) -> dict:
        """
        Send job notification emails to multiple eligible students

        Args:
            job_id: ID of the job
            job_title: Title of the job
            company_name: Name of the company
            job_description: Description of the job
            salary_lpa: Salary in LPA
            application_deadline: Application deadline
            job_location: Job location
            eligible_students: List of eligible students with email and name

        Returns:
            dict: Statistics of email sending {success: int, failed: int, skipped: int}
        """
        if not settings.enable_email:
            logger.info(f"Email service disabled. Skipping bulk job notifications for job {job_id}")
            return {"success": 0, "failed": 0, "skipped": len(eligible_students)}

        stats = {"success": 0, "failed": 0, "skipped": 0}

        for student in eligible_students:
            success = await EmailService.send_job_notification_email(
                recipient_email=student.get("email"),
                student_name=student.get("name", "Student"),
                job_title=job_title,
                company_name=company_name,
                job_description=job_description,
                salary_lpa=salary_lpa,
                application_deadline=application_deadline,
                job_location=job_location,
            )

            if success:
                stats["success"] += 1
            else:
                stats["failed"] += 1

        logger.info(f"Bulk job notification stats for job {job_id}: {stats}")
        return stats
