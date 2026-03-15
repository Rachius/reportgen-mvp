from jinja2 import Environment, FileSystemLoader
from xhtml2pdf import pisa
import io
import os

TEMPLATES_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'templates')

class BaseReportBuilder:
    template_path: str = None

    def __init__(self, analysis: dict, profile: dict = None):
        self.analysis = analysis
        self.profile = profile or {}
        self.env = Environment(loader=FileSystemLoader(TEMPLATES_DIR))

    def get_context(self) -> dict:
        return {
            "analysis": self.analysis,
            "company_name": self.profile.get("company_name", ""),
            "currency": self.profile.get("currency", "ARS"),
            "industry": self.profile.get("industry", ""),
        }

    def render_html(self) -> str:
        template = self.env.get_template(self.template_path)
        return template.render(**self.get_context())

    def build_pdf(self) -> bytes:
        html = self.render_html()
        buffer = io.BytesIO()
        pisa.CreatePDF(io.StringIO(html), dest=buffer, encoding='utf-8')
        return buffer.getvalue()


def get_builder(report_type: str, analysis: dict, profile: dict = None) -> BaseReportBuilder:
    from app.pdf_builders.ventas_builder import VentasReportBuilder
    builders = {
        "ventas": VentasReportBuilder,
    }
    builder_class = builders.get(report_type, VentasReportBuilder)
    return builder_class(analysis, profile)