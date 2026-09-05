export type AdminAlertAction = 'acknowledge' | 'resolve';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

function apiUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}

async function assertOk(response: Response): Promise<Response> {
  if (!response.ok) {
    const message = await response.text().catch(() => 'Request failed');
    throw new Error(message || `Request failed with ${response.status}`);
  }

  return response;
}

export async function acknowledgeAlert(id: string) {
  return (
    await assertOk(
      await fetch(
        apiUrl(`/api/admin/alerts/${encodeURIComponent(id)}/acknowledge`),
        {
          method: 'POST',
        }
      )
    )
  ).json();
}

export async function resolveAlert(id: string) {
  return (
    await assertOk(
      await fetch(
        apiUrl(`/api/admin/alerts/${encodeURIComponent(id)}/resolve`),
        {
          method: 'POST',
        }
      )
    )
  ).json();
}

export async function createTestAlert() {
  return (
    await assertOk(
      await fetch(apiUrl('/api/admin/alerts/test'), {
        method: 'POST',
      })
    )
  ).json();
}

export async function getAdminOverview() {
  return (
    await assertOk(
      await fetch(apiUrl('/api/admin/overview'))
    )
  ).json();
}

export async function adminLogin(email: string, password: string) {
  return (
    await assertOk(
      await fetch(apiUrl('/api/admin/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })
    )
  ).json();
}