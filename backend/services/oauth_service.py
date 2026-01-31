"""OAuth Service - управление OAuth провайдерами"""

import requests
from config import Config


class OAuthProvider:
    """Базовый класс для OAuth провайдеров"""
    
    def __init__(self, client_id, client_secret, redirect_uri):
        self.client_id = client_id
        self.client_secret = client_secret
        self.redirect_uri = redirect_uri
    
    def get_authorization_url(self, state, **kwargs):
        raise NotImplementedError
    
    def exchange_code(self, code, **kwargs):
        raise NotImplementedError
    
    def get_user_info(self, access_token):
        raise NotImplementedError


class GoogleOAuthProvider(OAuthProvider):
    """Google OAuth провайдер"""
    
    AUTHORIZATION_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth'
    TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token'
    USERINFO_ENDPOINT = 'https://openidconnect.googleapis.com/v1/userinfo'
    
    def get_authorization_url(self, state, **kwargs):
        params = {
            'client_id': self.client_id,
            'response_type': 'code',
            'scope': 'openid email profile',
            'redirect_uri': self.redirect_uri,
            'state': state,
        }
        
        url = f"{self.AUTHORIZATION_ENDPOINT}?"
        url += '&'.join([f"{k}={v}" for k, v in params.items()])
        return url
    
    def exchange_code(self, code):
        """Обменять код на access_token"""
        data = {
            'code': code,
            'client_id': self.client_id,
            'client_secret': self.client_secret,
            'redirect_uri': self.redirect_uri,
            'grant_type': 'authorization_code',
        }
        
        response = requests.post(self.TOKEN_ENDPOINT, data=data)
        response.raise_for_status()
        return response.json()
    
    def get_user_info(self, access_token):
        """Получить информацию о пользователе"""
        headers = {'Authorization': f'Bearer {access_token}'}
        response = requests.get(self.USERINFO_ENDPOINT, headers=headers)
        response.raise_for_status()
        
        data = response.json()
        return {
            'id': data.get('sub'),
            'email': data.get('email'),
            'name': data.get('name'),
            'picture': data.get('picture'),
            'email_verified': data.get('email_verified', False),
        }


class GitHubOAuthProvider(OAuthProvider):
    """GitHub OAuth провайдер"""
    
    AUTHORIZATION_ENDPOINT = 'https://github.com/login/oauth/authorize'
    TOKEN_ENDPOINT = 'https://github.com/login/oauth/access_token'
    USERINFO_ENDPOINT = 'https://api.github.com/user'
    
    def get_authorization_url(self, state, **kwargs):
        params = {
            'client_id': self.client_id,
            'redirect_uri': self.redirect_uri,
            'scope': 'user:email',
            'state': state,
        }
        
        url = f"{self.AUTHORIZATION_ENDPOINT}?"
        url += '&'.join([f"{k}={v}" for k, v in params.items()])
        return url
    
    def exchange_code(self, code):
        """Обменять код на access_token"""
        data = {
            'client_id': self.client_id,
            'client_secret': self.client_secret,
            'code': code,
            'redirect_uri': self.redirect_uri,
        }
        
        headers = {'Accept': 'application/json'}
        response = requests.post(self.TOKEN_ENDPOINT, data=data, headers=headers)
        response.raise_for_status()
        return response.json()
    
    def get_user_info(self, access_token):
        """Получить информацию о пользователе"""
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Accept': 'application/vnd.github+json'
        }
        response = requests.get(self.USERINFO_ENDPOINT, headers=headers)
        response.raise_for_status()
        
        data = response.json()
        return {
            'id': str(data.get('id')),
            'email': data.get('email'),
            'name': data.get('name'),
            'picture': data.get('avatar_url'),
            'email_verified': True,  # GitHub верифицирует email
        }


class OAuthService:
    """Управление OAuth операциями"""
    
    def __init__(self):
        # Google OAuth
        if Config.GOOGLE_CLIENT_ID and Config.GOOGLE_CLIENT_SECRET:
            self.google = GoogleOAuthProvider(
                Config.GOOGLE_CLIENT_ID,
                Config.GOOGLE_CLIENT_SECRET,
                Config.GOOGLE_REDIRECT_URI
            )
        else:
            self.google = None
        
        # GitHub OAuth
        if Config.GITHUB_CLIENT_ID and Config.GITHUB_CLIENT_SECRET:
            self.github = GitHubOAuthProvider(
                Config.GITHUB_CLIENT_ID,
                Config.GITHUB_CLIENT_SECRET,
                Config.GITHUB_REDIRECT_URI
            )
        else:
            self.github = None
    
    def get_provider(self, provider_name):
        """Получить провайдера по имени"""
        if provider_name == 'google':
            if not self.google:
                raise ValueError("Google OAuth не сконфигурирован")
            return self.google
        elif provider_name == 'github':
            if not self.github:
                raise ValueError("GitHub OAuth не сконфигурирован")
            return self.github
        else:
            raise ValueError(f"Неизвестный провайдер: {provider_name}")
    
    def get_authorization_url(self, provider, state):
        """Получить URL авторизации"""
        provider_obj = self.get_provider(provider)
        return provider_obj.get_authorization_url(state)
    
    def exchange_code(self, provider, code):
        """Обменять код на токены"""
        provider_obj = self.get_provider(provider)
        token_response = provider_obj.exchange_code(code)
        
        if 'error' in token_response:
            raise Exception(f"Token exchange failed: {token_response.get('error_description')}")
        
        return token_response
    
    def get_user_info(self, provider, access_token):
        """Получить информацию о пользователе"""
        provider_obj = self.get_provider(provider)
        return provider_obj.get_user_info(access_token)


# Глобальный экземпляр для использования во всем приложении
oauth_service = None

def get_oauth_service():
    """Получить или инициализировать oauth_service"""
    global oauth_service
    if oauth_service is None:
        oauth_service = OAuthService()
    return oauth_service
