import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to_email, subject, message, pdf_attachment, verification_number, client_name, site_name, audit_number, prospect_name } = await req.json()

    // Configuration Resend (GRATUIT jusqu'à 3,000 emails/mois)
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'contact@jpsincendie.com'
    
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY non configurée')
    }

    // Préparer le contenu de l'email
    let emailSubject = subject || 'Document BMSI'
    let emailContent = message || 'Veuillez trouver ci-joint le document demandé.'
    
    // Personnaliser selon le type de document
    if (verification_number) {
      emailSubject = `Bon de vérification - ${verification_number}`
      emailContent = `Bonjour,

Veuillez trouver ci-joint le bon de vérification pour le site ${site_name} du client ${client_name}.

Numéro de bon : ${verification_number}

Cordialement,
J.P. SÉCURITÉ INCENDIE`
    } else if (audit_number) {
      emailSubject = `Rapport d'audit - ${audit_number}`
      emailContent = `Bonjour,

Veuillez trouver ci-joint le rapport d'audit pour ${prospect_name}.

Numéro d'audit : ${audit_number}

Cordialement,
J.P. SÉCURITÉ INCENDIE`
    }

    // Préparer les données pour Resend
    const emailData: any = {
      from: FROM_EMAIL,
      to: [to_email],
      subject: emailSubject,
      text: emailContent
    }

    // Ajouter la pièce jointe si présente
    if (pdf_attachment) {
      emailData.attachments = [
        {
          filename: verification_number ? 
            `Bon_Verification_${verification_number}.pdf` : 
            `Audit_${audit_number}_${prospect_name}.pdf`,
          content: pdf_attachment
        }
      ]
    }

    // Envoyer l'email via Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Erreur Resend: ${response.status} - ${errorText}`)
    }

    const result = await response.json()

    return new Response(
      JSON.stringify({ success: true, message: 'Email envoyé avec succès', id: result.id }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Erreur:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
}) 