import { expect, test } from '@playwright/test';

const createAccessToken = (expiresAt: number) => {
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const payload = {
    exp: expiresAt,
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name': 'static-test-user',
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress': 'test@example.com',
    'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': 'Admin',
    perm: [],
  };

  return `${encode({ alg: 'none', typ: 'JWT' })}.${encode(payload)}.static-test-signature`;
};

test.describe('Static export routing and authorization', () => {
  test('redirects an unauthenticated dashboard request to sign-in', async ({ page }) => {
    await page.route('**/api/v1/users/refresh', (route) =>
      route.fulfill({ status: 401, contentType: 'application/json', body: '{}' }),
    );

    await page.goto('/dashboard/profiles/');

    await expect(page).toHaveURL(/\/auth\/signin\/?$/);
  });

  test('restores a session before showing the dashboard', async ({ page }) => {
    const accessToken = createAccessToken(Math.floor(Date.now() / 1000) + 3600);

    await page.route('**/api/v1/users/refresh', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { accessToken, expiresIn: 3600 } }),
      }),
    );
    await page.route('**/api/v1/profiles', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      }),
    );

    await page.goto('/dashboard/profiles/');

    await expect(page.getByRole('heading', { name: 'Профили' })).toBeVisible();
    await expect(page).toHaveURL(/\/dashboard\/profiles\/?$/);
  });

  test('serves a direct encoded profile slug and preserves its tab', async ({ context, page }) => {
    const accessToken = createAccessToken(Math.floor(Date.now() / 1000) + 3600);
    const baseURL = test.info().project.use.baseURL as string;

    await context.addCookies([{ name: 'accessToken', value: accessToken, url: baseURL }]);
    await page.route('**/api/v1/profiles/details', (route) =>
      route.fulfill({ status: 500, contentType: 'application/json', body: '{}' }),
    );

    const response = await page.goto('/dashboard/profile/Test%20Profile?tab=mods');

    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle('Настройка профиля Test Profile');
    await expect(page).toHaveURL(/\/dashboard\/profile\/Test%20Profile\?tab=mods$/);
  });

  test('returns 404 for an unknown non-profile route', async ({ request }) => {
    const response = await request.get('/unknown-static-route/');
    expect(response.status()).toBe(404);
  });
});
