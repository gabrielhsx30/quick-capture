document.addEventListener('DOMContentLoaded', () => {
  // 1. MAPEAMENTO: Identificar os elementos pelo ID
  const form = document.getElementById('captureForm');
  const textarea = document.getElementById('captureText');
  const select = document.getElementById('captureCategory');
  const button = document.getElementById('submitButton');
  const dateInput = document.getElementById('data-agendamento');
  const startTimeInput = document.getElementById('hora-inicial');
  const endTimeInput = document.getElementById('hora-termino');
  const dateContainer = document.getElementById('agendamentoContainer');

  // 2. EVENTO: Adicionar EventListener no submit do formulário
  form.addEventListener('submit', async (e) => {
    // Prevenir o recarregamento automático da página
    e.preventDefault();

    // Captura garantida de valores diretamente no momento do submit
    const textValue = textarea.value.trim();
    const categoryValue = select.value;
    
    // Obter os valores dos campos de data e hora
    const dateValue = dateInput ? dateInput.value : '';
    const startTimeValue = startTimeInput ? startTimeInput.value : '';
    const endTimeValue = endTimeInput ? endTimeInput.value : '';

    // VALIDAÇÃO: Verificar se o textarea possui conteúdo útil
    if (!textValue) {
      showErrorToast('Digite seu insight, ideia ou tarefa antes de enviar.');
      return;
    }

    // UX CONTROLS: Desabilitar o botão e atualizar o texto para evitar múltiplos cliques
    const originalButtonHtml = button.innerHTML;
    button.disabled = true;
    button.innerHTML = '<span>Enviando...</span> <div class="spinner-border spinner-border-sm text-light ms-2" role="status"><span class="visually-hidden">Enviando...</span></div>';

    // MONTAGEM DO PAYLOAD E SANITIZAÇÃO
    const payload = {
      texto: textValue,
      categoria: categoryValue
    };

    // Se o usuário preencheu a data, montamos o agendamento
    if (dateValue) {
      const startTime = startTimeValue || '00:00';
      const dataAgendamento = `${dateValue}T${startTime}`;
      
      // TRAVA DE SEGURANÇA: Se a dataTermino (hora-termino) estiver vazia, iguala à dataAgendamento
      const dataTermino = endTimeValue ? `${dateValue}T${endTimeValue}` : dataAgendamento;

      payload.dataAgendamento = dataAgendamento;
      payload.dataTermino = dataTermino;
    }

    // TRATAMENTO DE ERROS: Bloco try/catch/finally
    try {
      // Log de debug: Imprimir o objeto final exatamente antes do fetch
      console.log(payload);

      // URL de produção & Content-Type: Requisição POST para o webhook n8n de produção
      const response = await fetch('https://n8n.srv1730117.hstgr.cloud/webhook/458c080c-c6a7-4b2e-8a5b-a5a65be6662d', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      // No 'try', se a resposta for bem sucedida (status 200-299)
      if (response.ok) {
        const temAgendamento = Boolean(payload.dataAgendamento);

        // Título e mensagem mudam conforme houve ou não agendamento
        const titulo = temAgendamento
          ? '✅ Confirmado no Telegram e agendado no Calendar!'
          : '✅ Registrado no Telegram!';

        let resumoMsg = `<strong>Texto:</strong> ${textValue}<br><strong>Categoria:</strong> ${categoryValue}`;
        if (temAgendamento) {
          resumoMsg += `<br><strong>Agendado:</strong> ${dateValue} às ${startTimeValue || '00:00'}`;
        }

        // Atualiza título e conteúdo, e exibe o toast de sucesso
        document.getElementById('toastTitle').textContent = titulo;
        document.getElementById('toastMessage').innerHTML = resumoMsg;
        const toastElement = document.getElementById('successToast');
        const toast = new bootstrap.Toast(toastElement, { delay: 5000 });
        toast.show();

        // Limpar os campos do formulário
        textarea.value = '';
        if (dateInput) dateInput.value = '';
        if (startTimeInput) startTimeInput.value = '';
        if (endTimeInput) endTimeInput.value = '';
      } else {
        // Tenta extrair a mensagem de erro estruturada que o n8n retorna ({"success":false,"error":"..."})
        let mensagemErro = `Erro do servidor (Status: ${response.status})`;
        try {
          const corpoErro = await response.json();
          if (corpoErro && corpoErro.error) {
            mensagemErro = corpoErro.error;
          }
        } catch (_) {
          // resposta não era JSON, mantém a mensagem genérica
        }
        throw new Error(mensagemErro);
      }
    } catch (error) {
      // No 'catch', capturar erros de conexão ou de lógica e exibir o toast de erro
      showErrorToast(error.message);
    } finally {
      // Em ambos os casos, restaurar o botão de envio
      button.disabled = false;
      button.innerHTML = originalButtonHtml;
    }
  });

  // Exibe o toast de erro estilizado (substitui o alert() nativo do navegador)
  function showErrorToast(mensagem) {
    document.getElementById('errorToastMessage').textContent = mensagem;
    const toastElement = document.getElementById('errorToast');
    const toast = new bootstrap.Toast(toastElement, { delay: 6000 });
    toast.show();
  }
});
