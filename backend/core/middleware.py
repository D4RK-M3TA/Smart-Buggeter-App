from .models import AuditLog


class AuditLogMiddleware:
    AUDIT_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE']
    EXCLUDE_PATHS = ['/api/docs/', '/api/schema/', '/api/redoc/', '/admin/']

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        
        if request.method in self.AUDIT_METHODS:
            if not any(request.path.startswith(path) for path in self.EXCLUDE_PATHS):
                self._log_request(request, response)
        
        return response

    def _log_request(self, request, response):
        if not hasattr(request, 'user') or not request.user.is_authenticated:
            return
        
        if response.status_code >= 400:
            return
        
        action = self._get_action(request.method)
        model_name = self._extract_model_name(request.path)
        
        try:
            AuditLog.objects.create(
                user=request.user,
                action=action,
                model_name=model_name,
                endpoint=request.path,
                ip_address=self._get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', '')[:500]
            )
        except Exception:
            pass

    def _get_action(self, method):
        actions = {
            'POST': 'create',
            'PUT': 'update',
            'PATCH': 'update',
            'DELETE': 'delete',
        }
        return actions.get(method, 'update')

    def _extract_model_name(self, path):
        parts = [p for p in path.split('/') if p and p != 'api']
        return parts[0] if parts else ''

    def _get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR')
