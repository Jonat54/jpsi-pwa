// Fonction pour générer le PDF détaillé - VERSION SIMPLIFIÉE
async function generatePDF2() {
  try {
    document.getElementById('generateBtn2').classList.add('loading');
    
    // Récupérer les données depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const clientName = urlParams.get('clientName') || 'Client_Inconnu';
    const siteName = urlParams.get('siteName') || 'Site_Inconnu';
    const interventionId = urlParams.get('intervention');
    
    // Clôturer l'intervention
    await closeIntervention();
    
    // Créer un PDF simple
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Ajouter du contenu simple
    doc.text('RAPPORT DE VÉRIFICATION', 20, 20);
    doc.text(`Client: ${clientName}`, 20, 30);
    doc.text(`Site: ${siteName}`, 20, 40);
    doc.text(`Numéro de bon: ${numeroDeBon}`, 20, 50);
    doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 20, 60);
    
    // Générer le PDF
    const fileName = `${numeroDeBon} - ${clientName} - ${siteName}.pdf`;
    doc.save(fileName);
    
    // Upload vers Supabase Storage
    try {
      const pdfBlob = doc.output('blob');
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('rapports-pdf')
        .upload(`interventions/${interventionId}/${fileName}`, pdfBlob, {
          contentType: 'application/pdf',
          upsert: true
        });
      
      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from('rapports-pdf')
          .getPublicUrl(`interventions/${interventionId}/${fileName}`);
        
        await savePDFUrl(interventionId, urlData.publicUrl, fileName);
        console.log('✅ PDF uploadé avec succès');
      }
    } catch (error) {
      console.error('❌ Erreur upload:', error);
    }
    
    document.getElementById('generateBtn2').classList.remove('loading');
    
    // Redirection
    setTimeout(() => {
      window.location.href = 'verification.html';
    }, 1000);
    
  } catch (error) {
    console.error('Erreur lors de la génération du PDF détaillé:', error);
    alert('Erreur lors de la génération du PDF détaillé');
    document.getElementById('generateBtn2').classList.remove('loading');
  }
}


