from jinja2 import Environment, FileSystemLoader
from xhtml2pdf import pisa
import io
import os
from typing import Optional

TEMPLATES_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'templates')

class BaseReportBuilder:
    template_path: str = None

    def __init__(self, analysis: dict, profile: dict = None):
        self.analysis = analysis
        self.profile = profile or {}
        self.env = Environment(loader=FileSystemLoader(TEMPLATES_DIR))

    def get_context(self) -> dict:
        logo_b64 = None
        if self.profile.get("logo_url"):
            logo_b64 = get_logo_as_base64(self.profile["logo_url"])
        return {
            "analysis": self.analysis,
            "company_name": self.profile.get("company_name", ""),
            "currency": self.profile.get("currency", "ARS"),
            "industry": self.profile.get("industry", ""),
            "logo_b64": logo_b64,
        }

    def render_html(self) -> str:
        template = self.env.get_template(self.template_path)
        return template.render(**self.get_context())

    def build_pdf(self) -> bytes:
        html = self.render_html()
        buffer = io.BytesIO()
        pisa.CreatePDF(io.StringIO(html), dest=buffer, encoding='utf-8')
        return buffer.getvalue()


def get_logo_as_base64(logo_url: str) -> Optional[str]:
    import requests
    import base64
    try:
        response = requests.get(logo_url, timeout=5)
        if response.status_code == 200:
            content_type = response.headers.get("Content-Type", "image/png")
            b64 = base64.b64encode(response.content).decode()
            return f"data:{content_type};base64,{b64}"
    except Exception:
        pass
    return None


def get_builder(report_type: str, analysis: dict, profile: dict = None) -> BaseReportBuilder:
    from app.pdf_builders.ventas_builder import VentasReportBuilder
    builders = {
        "ventas": VentasReportBuilder,
    }
    builder_class = builders.get(report_type, VentasReportBuilder)
    return builder_class(analysis, profile)
