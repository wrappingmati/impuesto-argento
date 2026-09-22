"""Security utilities and SSRF (Server-Side Request Forgery) protection."""

import ipaddress
import logging
import socket
from urllib.parse import urlparse
from typing import Tuple

logger = logging.getLogger("scraper_service.security")

# Hostnames explicitly blocked
BLOCKED_HOSTNAMES = {
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
    "::1",
    "metadata.google.internal",
    "instance-data",
}


def validate_scrape_url(url: str) -> Tuple[bool, str]:
    """Validate that a URL is safe to scrape and not targeting internal/private networks (SSRF prevention).
    
    Args:
        url: The candidate URL to validate.
        
    Returns:
        Tuple of (is_safe: bool, reason_or_empty: str).
    """
    if not url or not isinstance(url, str):
        return False, "La URL no puede estar vacía."

    url = url.strip()

    try:
        parsed = urlparse(url)
    except Exception as exc:
        return False, f"Formato de URL inválido: {str(exc)}"

    # 1. Check scheme
    if parsed.scheme.lower() not in ("http", "https"):
        return False, "La URL provista debe comenzar con http:// o https://"

    # 2. Check hostname presence
    hostname = parsed.hostname
    if not hostname:
        return False, "La URL no contiene un nombre de dominio válido."

    hostname_clean = hostname.strip().lower()

    # 3. Block explicit local names and suffixes
    if hostname_clean in BLOCKED_HOSTNAMES or hostname_clean.endswith(".local") or hostname_clean.endswith(".internal"):
        logger.warning("SSRF blocked direct hostname match: %s", hostname_clean)
        return False, "Acceso denegado: no se permite scrapear direcciones locales o de red interna."

    # 4. Check if hostname is already an IP address string
    try:
        direct_ip = ipaddress.ip_address(hostname_clean)
        if is_restricted_ip(direct_ip):
            logger.warning("SSRF blocked direct IP: %s", direct_ip)
            return False, f"Acceso denegado: la dirección IP {direct_ip} corresponde a una red privada o reservada."
    except ValueError:
        # Not a raw IP literal, it's a domain name; proceed to DNS resolution
        pass

    # 5. Resolve DNS and inspect all resolved IP addresses
    try:
        addr_info = socket.getaddrinfo(hostname_clean, None)
        if not addr_info:
            return False, "No se pudo resolver el dominio de la URL provista."

        for item in addr_info:
            sockaddr = item[4]
            ip_str = sockaddr[0]
            ip = ipaddress.ip_address(ip_str)

            if is_restricted_ip(ip):
                logger.warning("SSRF blocked resolved IP %s for hostname %s", ip_str, hostname_clean)
                return False, f"Acceso denegado: el dominio resuelve a una dirección de red privada ({ip_str})."

    except socket.gaierror:
        return False, "No se pudo resolver la dirección de internet para ese dominio. Verificá que la URL exista."
    except Exception as exc:
        logger.error("Error validating URL %s: %s", url, exc)
        return False, f"Error al verificar la seguridad de la URL: {str(exc)}"

    return True, ""


def is_restricted_ip(ip: ipaddress.IPv4Address | ipaddress.IPv6Address) -> bool:
    """Check if an IP address belongs to private, loopback, link-local, or reserved ranges."""
    return (
        ip.is_private
        or ip.is_loopback
        or ip.is_link_local
        or ip.is_reserved
        or ip.is_multicast
        or ip.is_unspecified
    )

