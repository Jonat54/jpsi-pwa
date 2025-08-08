// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'onboarding@resend.dev';

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('📥 Requête reçue');
    
    // Lire le body brut d'abord
    const rawBody = await req.text();
    console.log('📄 Body brut:', rawBody.substring(0, 200) + '...');
    
    // Améliorer la gestion du JSON
    let body;
    try {
      body = JSON.parse(rawBody);
      console.log('✅ JSON parsé avec succès');
    } catch (jsonError) {
      console.error('❌ Erreur parsing JSON:', jsonError);
      console.error('📄 Body problématique:', rawBody);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'JSON invalide dans la requête',
          details: jsonError.message
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    const { to_email, subject, message, pdf_attachment, verification_number, client_name, site_name, audit_number, prospect_name } = body;

    console.log('📧 Données extraites:', {
      to_email,
      verification_number,
      client_name,
      site_name,
      has_pdf: !!pdf_attachment
    });

    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY non configurée')
    }

    if (!to_email) {
      throw new Error('Email destinataire manquant')
    }

    // Préparer le contenu de l'email
    let emailSubject = subject || 'Document BMSI'
    let emailContent = message || 'Veuillez trouver ci-joint le document demandé.'
    
    // Personnaliser selon le type de document
    if (verification_number) {
      emailSubject = `Bon de vérification - ${verification_number}`
      emailContent = `Bonjour,

Veuillez trouver ci-joint le bon de vérification pour le site ${site_name || 'N/A'} du client ${client_name || 'N/A'}.

Numéro de bon : ${verification_number}

Cordialement,
J.P. SÉCURITÉ INCENDIE`
    } else if (audit_number) {
      emailSubject = `Rapport d'audit - ${audit_number}`
      emailContent = `Bonjour,

Veuillez trouver ci-joint le rapport d'audit pour ${prospect_name || 'N/A'}.

Numéro d'audit : ${audit_number}

Cordialement,
J.P. SÉCURITÉ INCENDIE`
    }

    // Préparer les données pour Resend
    const emailData = {
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
            `Audit_${audit_number || 'unknown'}_${prospect_name || 'unknown'}.pdf`,
          content: pdf_attachment
        }
      ]
    }

    console.log('📤 Envoi email à:', to_email);
    console.log('📝 Sujet:', emailSubject);
    console.log('📎 Avec pièce jointe:', !!pdf_attachment);

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify(emailData)
    });

    if (!res.ok) {
      const errorText = await res.text()
      console.error('❌ Erreur Resend:', res.status, errorText);
      throw new Error(`Erreur Resend: ${res.status} - ${errorText}`)
    }

    const data = await res.json();
    console.log('✅ Email envoyé avec succès:', data.id);
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Email envoyé avec succès', 
      id: data.id 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Erreur générale:', error)
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
}); 