/**
 * VPN Detection Service (Zero external packages)
 * Detects active VPN / proxy / datacenter tunnels via fast IP intelligence checks
 */

let lastVpnCheckResult = null;
let lastVpnCheckTime = 0;
const CACHE_TTL_MS = 30000; // 30 seconds cache

/**
 * Fetch with strict timeout
 */
async function fetchWithTimeout(url, options = {}, timeoutMs = 2500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Check 1: Cloudflare trace (Ultra fast Anycast check)
 * Checks for Cloudflare WARP VPN and non-BD country
 */
async function checkCloudflareTrace() {
  try {
    const res = await fetchWithTimeout('https://www.cloudflare.com/cdn-cgi/trace', {
      headers: { Accept: 'text/plain' },
    }, 2000);

    if (!res.ok) return null;
    const text = await res.text();
    const lines = text.split('\n');
    const data = {};
    for (const line of lines) {
      const [k, v] = line.split('=');
      if (k && v) data[k.trim()] = v.trim();
    }

    const isWarp = data.warp === 'on' || data.warp === 'plus';
    const loc = data.loc || '';
    const isForeign = Boolean(loc && loc !== 'BD' && loc !== 'XX');

    if (isWarp) {
      return {
        isVpn: true,
        reason: 'Cloudflare WARP VPN active',
        loc,
        ip: data.ip,
      };
    }

    if (isForeign) {
      return {
        isVpn: true,
        reason: `Connection routed via ${loc} (Foreign VPN/Proxy)`,
        loc,
        ip: data.ip,
      };
    }

    return { isVpn: false, loc, ip: data.ip };
  } catch {
    return null;
  }
}

/**
 * Check 2: ipwho.is (Free, HTTPS, returns detailed security object)
 */
async function checkIpWhoIs() {
  try {
    const res = await fetchWithTimeout('https://ipwho.is/', {
      headers: { Accept: 'application/json' },
    }, 2500);

    if (!res.ok) return null;
    const data = await res.json();
    if (!data || !data.success) return null;

    const security = data.security || {};
    const countryCode = data.country_code;

    const isVpnFlag = Boolean(
      security.vpn ||
      security.proxy ||
      security.tor ||
      security.anonymous ||
      security.hosting
    );

    const isForeign = Boolean(countryCode && countryCode !== 'BD');

    if (isVpnFlag || isForeign) {
      const reason = isVpnFlag
        ? 'VPN or Proxy connection detected'
        : `Connected outside Bangladesh (${data.country || countryCode})`;

      return {
        isVpn: true,
        reason,
        country: data.country,
        countryCode,
        ip: data.ip,
      };
    }

    return {
      isVpn: false,
      country: data.country,
      countryCode,
      ip: data.ip,
    };
  } catch {
    return null;
  }
}

/**
 * Main VPN Status Check
 * Returns: { isVpn: boolean, reason?: string, ip?: string }
 */
export async function checkVpnStatus(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && lastVpnCheckResult && now - lastVpnCheckTime < CACHE_TTL_MS) {
    return lastVpnCheckResult;
  }

  try {
    // Run checks in parallel for maximum speed
    const [cfResult, ipwhoResult] = await Promise.allSettled([
      checkCloudflareTrace(),
      checkIpWhoIs(),
    ]);

    const cf = cfResult.status === 'fulfilled' ? cfResult.value : null;
    const ipwho = ipwhoResult.status === 'fulfilled' ? ipwhoResult.value : null;

    let result = { isVpn: false };

    if (ipwho && ipwho.isVpn) {
      result = {
        isVpn: true,
        reason: ipwho.reason,
        ip: ipwho.ip,
        country: ipwho.country,
      };
    } else if (cf && cf.isVpn) {
      result = {
        isVpn: true,
        reason: cf.reason,
        ip: cf.ip,
        loc: cf.loc,
      };
    }

    lastVpnCheckResult = result;
    lastVpnCheckTime = now;
    return result;
  } catch (error) {
    // If offline or network check fails, fail safely without blocking the app
    return { isVpn: false, error: error.message };
  }
}

