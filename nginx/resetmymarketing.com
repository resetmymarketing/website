server {
    listen 80;
    server_name resetmymarketing.com www.resetmymarketing.com;

    # Redirect HTTP to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name resetmymarketing.com www.resetmymarketing.com;

    # SSL certs (managed by Certbot)
    ssl_certificate /etc/letsencrypt/live/resetmymarketing.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/resetmymarketing.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy to Next.js on port 3007
    location / {
        proxy_pass http://127.0.0.1:3007;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
    }

    # Static assets caching
    location /_next/static {
        proxy_pass http://127.0.0.1:3007;
        proxy_set_header Host $host;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }

    # Deny access to dotfiles
    location ~ /\. {
        deny all;
        return 404;
    }
}
