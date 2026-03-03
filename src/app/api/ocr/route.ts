import { NextRequest, NextResponse } from 'next/server';

const EXTRACTLAB_API_URL = 'https://api.extractlab.com.br/api/batch/extract';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const modelName = formData.get('modelName') as string;
    const apiToken = formData.get('apiToken') as string;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    // Use token from request, env, or fail
    const token = apiToken || process.env.EXTRACTLAB_API_TOKEN;
    const model = modelName || process.env.EXTRACTLAB_MODEL_NAME || 'mercado';

    if (!token) {
      return NextResponse.json(
        { error: 'Token da API ExtractLab não configurado. Vá em Configurações para adicionar.' },
        { status: 401 }
      );
    }

    // Forward to ExtractLab API
    const extractFormData = new FormData();
    extractFormData.append('file', file);
    extractFormData.append('modelName', model);

    const response = await fetch(EXTRACTLAB_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: extractFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Erro ao processar documento';

      if (response.status === 401) {
        errorMessage = 'Token inválido ou expirado. Verifique seu token nas Configurações.';
      } else if (response.status === 404) {
        errorMessage = `Modelo "${model}" não encontrado na sua conta ExtractLab. Você precisa criar e treinar um modelo primeiro. Vá em Configurações → Guia de Setup para instruções detalhadas.`;
      } else if (response.status === 429) {
        errorMessage = 'Limite de documentos excedido na ExtractLab. Aguarde ou faça upgrade do plano.';
      } else if (response.status === 400) {
        errorMessage = 'Arquivo inválido ou formato não suportado. Use JPG, PNG ou PDF.';
      } else if (response.status === 422) {
        errorMessage = `O modelo "${model}" ainda não foi treinado. Acesse a ExtractLab e faça o treinamento com pelo menos 5 documentos de exemplo.`;
      }

      console.error('ExtractLab API error:', response.status, errorText);
      return NextResponse.json({ error: errorMessage }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('OCR API error:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar a imagem. Tente novamente.' },
      { status: 500 }
    );
  }
}
