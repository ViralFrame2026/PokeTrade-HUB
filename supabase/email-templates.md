# Plantillas de email Supabase

Estas plantillas se pegan en Supabase, dentro de `Authentication > Emails > Templates`.
Usan las variables oficiales de Supabase como `{{ .ConfirmationURL }}`, `{{ .Email }}` y `{{ .SiteURL }}`.

## Confirm signup

Subject:

```text
Confirmá tu cuenta en PokeTrade HUB
```

Body:

```html
<div style="margin:0;padding:0;background:#071535;font-family:Arial,Helvetica,sans-serif;color:#ffffff;">
  <div style="max-width:620px;margin:0 auto;padding:32px 20px;">
    <div style="border-bottom:4px solid #ffcb05;background:#2046b3;padding:20px;border-radius:14px 14px 0 0;">
      <div style="font-size:22px;font-weight:900;letter-spacing:2px;color:#ffcb05;">POKETRADE</div>
      <div style="font-size:12px;font-weight:800;color:#ffffff;">HUB TCG</div>
    </div>

    <div style="background:#ffffff;color:#172554;padding:28px;border-radius:0 0 14px 14px;">
      <h1 style="margin:0 0 12px;font-size:28px;line-height:1.1;color:#172554;">Confirmá tu cuenta</h1>
      <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#334155;">
        Estás a un paso de entrar a PokeTrade HUB, la comunidad para publicar,
        comprar, vender, intercambiar y participar en sorteos de Pokemon TCG.
      </p>
      <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#ffcb05;color:#111827;text-decoration:none;font-weight:900;padding:14px 20px;border-radius:10px;">
        Confirmar cuenta
      </a>
      <p style="margin:22px 0 0;font-size:13px;line-height:1.5;color:#64748b;">
        Si no creaste esta cuenta con {{ .Email }}, podés ignorar este mensaje.
      </p>
    </div>
  </div>
</div>
```

## Reset password

Subject:

```text
Restablecé tu contraseña de PokeTrade HUB
```

Body:

```html
<div style="margin:0;padding:0;background:#071535;font-family:Arial,Helvetica,sans-serif;color:#ffffff;">
  <div style="max-width:620px;margin:0 auto;padding:32px 20px;">
    <div style="border-bottom:4px solid #ffcb05;background:#2046b3;padding:20px;border-radius:14px 14px 0 0;">
      <div style="font-size:22px;font-weight:900;letter-spacing:2px;color:#ffcb05;">POKETRADE</div>
      <div style="font-size:12px;font-weight:800;color:#ffffff;">SEGURIDAD DE CUENTA</div>
    </div>

    <div style="background:#ffffff;color:#172554;padding:28px;border-radius:0 0 14px 14px;">
      <h1 style="margin:0 0 12px;font-size:28px;line-height:1.1;color:#172554;">Creá una nueva contraseña</h1>
      <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#334155;">
        Recibimos una solicitud para restablecer la contraseña de tu cuenta.
        Usá este enlace para elegir una nueva contraseña.
      </p>
      <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#ffcb05;color:#111827;text-decoration:none;font-weight:900;padding:14px 20px;border-radius:10px;">
        Restablecer contraseña
      </a>
      <p style="margin:22px 0 0;font-size:13px;line-height:1.5;color:#64748b;">
        Si no pediste este cambio, no hagas clic en el botón. Tu contraseña actual seguirá activa.
      </p>
    </div>
  </div>
</div>
```

## Magic link

Subject:

```text
Tu enlace para entrar a PokeTrade HUB
```

Body:

```html
<div style="margin:0;padding:0;background:#071535;font-family:Arial,Helvetica,sans-serif;color:#ffffff;">
  <div style="max-width:620px;margin:0 auto;padding:32px 20px;">
    <div style="border-bottom:4px solid #ffcb05;background:#2046b3;padding:20px;border-radius:14px 14px 0 0;">
      <div style="font-size:22px;font-weight:900;letter-spacing:2px;color:#ffcb05;">POKETRADE</div>
      <div style="font-size:12px;font-weight:800;color:#ffffff;">ACCESO SEGURO</div>
    </div>

    <div style="background:#ffffff;color:#172554;padding:28px;border-radius:0 0 14px 14px;">
      <h1 style="margin:0 0 12px;font-size:28px;line-height:1.1;color:#172554;">Entrá a tu cuenta</h1>
      <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#334155;">
        Usá este enlace para iniciar sesión en PokeTrade HUB de forma segura.
      </p>
      <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#ffcb05;color:#111827;text-decoration:none;font-weight:900;padding:14px 20px;border-radius:10px;">
        Entrar a PokeTrade HUB
      </a>
      <p style="margin:22px 0 0;font-size:13px;line-height:1.5;color:#64748b;">
        Si no solicitaste este acceso, podés ignorar este mensaje.
      </p>
    </div>
  </div>
</div>
```

## Change email address

Subject:

```text
Confirmá el cambio de email en PokeTrade HUB
```

Body:

```html
<div style="margin:0;padding:0;background:#071535;font-family:Arial,Helvetica,sans-serif;color:#ffffff;">
  <div style="max-width:620px;margin:0 auto;padding:32px 20px;">
    <div style="border-bottom:4px solid #ffcb05;background:#2046b3;padding:20px;border-radius:14px 14px 0 0;">
      <div style="font-size:22px;font-weight:900;letter-spacing:2px;color:#ffcb05;">POKETRADE</div>
      <div style="font-size:12px;font-weight:800;color:#ffffff;">CAMBIO DE EMAIL</div>
    </div>

    <div style="background:#ffffff;color:#172554;padding:28px;border-radius:0 0 14px 14px;">
      <h1 style="margin:0 0 12px;font-size:28px;line-height:1.1;color:#172554;">Confirmá tu nuevo email</h1>
      <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#334155;">
        Para proteger tu cuenta, necesitamos confirmar este cambio de dirección.
      </p>
      <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#ffcb05;color:#111827;text-decoration:none;font-weight:900;padding:14px 20px;border-radius:10px;">
        Confirmar cambio
      </a>
      <p style="margin:22px 0 0;font-size:13px;line-height:1.5;color:#64748b;">
        Si no solicitaste este cambio, revisá la seguridad de tu cuenta.
      </p>
    </div>
  </div>
</div>
```

## Recomendacion de marca

Para que no salga como email generico de Supabase, configurar tambien:

- `Authentication > Emails > SMTP Settings`: usar un dominio propio o un proveedor como Resend, Brevo, Mailgun o SendGrid.
- `Authentication > URL Configuration > Site URL`: `https://poketrade-hub.vercel.app`
- `Authentication > URL Configuration > Redirect URLs`: `https://poketrade-hub.vercel.app/**`
