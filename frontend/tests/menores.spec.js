import { test, expect } from '@playwright/test';

test('Muestra alerta legal al contactar a un trabajador menor de edad', async ({ page }) => {
    await page.route('**/api/search*', async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                professionals: [
                    {
                        id: 200,
                        name: 'Carlos (17 años)',
                        specialty: 'Limpieza',
                        rating: 5.0,
                        reviews: 0,
                        verified: true,
                        imageUrl: 'https://images.unsplash.com/photo-1557862921-37829c790f19',
                        is_online: true
                    }
                ],
                services: [],
                hashtags: []
            })
        });
    });

    await page.route('**/api/professionals/200', async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                id: 200,
                name: 'Carlos (17 años)',
                specialty: 'Limpieza',
                rating: 5.0,
                reviews: 0,
                verified: true,
                imageUrl: 'https://images.unsplash.com/photo-1557862921-37829c790f19',
                bio: 'Profesional de limpieza con experiencia.',
                birth_date: '2009-01-15'
            })
        });
    });

    await page.route('**/api/professionals/200/reviews', async route => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });

    await page.route('**/api/professionals/200/portfolio', async route => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });

    await page.goto('http://localhost:5173/home');
    await page.getByPlaceholder('¿Qué servicio necesitas hoy?').fill('Limpieza');
    await page.keyboard.press('Enter');
    await page.getByText('Carlos (17 años)').first().click();
    const alertaLegal = page.locator('.alerta-menor-edad');
    await expect(alertaLegal).toBeVisible();
    await expect(alertaLegal).toContainText('Usted está contactando a un menor de edad con permiso laboral vigente. Se recomienda la supervisión de un adulto');
    await page.getByRole('button', { name: 'Chatear ahora' }).click({ force: true });
});