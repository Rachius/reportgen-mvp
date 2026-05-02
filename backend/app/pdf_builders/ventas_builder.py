from app.pdf_builders.base_builder import BaseReportBuilder

class VentasReportBuilder(BaseReportBuilder):
    template_path = "ventas/report.html"

    def get_context(self) -> dict:
        ctx = super().get_context()
        analysis = self.analysis

        ctx["kpis"] = analysis.get("kpis", [])
        ctx["tendencias"] = analysis.get("tendencias", [])
        ctx["top_items"] = analysis.get("top_items", [])
        ctx["recomendaciones"] = analysis.get("recomendaciones", [])
        ctx["resumen_ejecutivo"] = analysis.get("resumen_ejecutivo", "")
        ctx["conclusion"] = analysis.get("conclusion", "")
        ctx["titulo"] = analysis.get("titulo", "Reporte de Ventas")

        return ctx