from flask import Flask, request, jsonify, send_file
import os
import librosa
import numpy as np
import scipy.signal as signal
import soundfile as sf
from werkzeug.utils import secure_filename

# Criando a aplicação Flask
app = Flask(__name__)

# Diretórios de upload e processamento
UPLOAD_FOLDER = 'uploads'
PROCESSED_FOLDER = 'processed'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PROCESSED_FOLDER, exist_ok=True)

# Função para aplicar filtro passa-baixa
def low_pass_filter(audio, sr, cutoff=4000, order=6):
    nyquist = 0.5 * sr
    normal_cutoff = cutoff / nyquist
    b, a = signal.butter(order, normal_cutoff, btype='low', analog=False)
    return signal.filtfilt(b, a, audio)

# Endpoint para upload e processamento do áudio
@app.route('/upload', methods=['POST'])
def upload_audio():
    if 'audio' not in request.files:
        return jsonify({'error': 'Nenhum arquivo enviado'}), 400

    file = request.files['audio']
    filename = secure_filename(file.filename)
    input_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(input_path)

    output_filename = f'filtered_{filename}'
    output_path = os.path.join(PROCESSED_FOLDER, output_filename)

    try:
        # Carregar o áudio com tratamento de erro
        audio, sr = librosa.load(input_path, sr=None)
        if audio is None or sr is None:
            return jsonify({'error': 'Falha ao carregar o áudio'}), 500

        # Aplicar filtro passa-baixa
        filtered_audio = low_pass_filter(audio, sr)

        # Salvar o áudio filtrado
        sf.write(output_path, filtered_audio.astype(np.float32), sr)

        return jsonify({'message': 'Áudio processado com sucesso', 'file': output_filename})
    except Exception as e:
        return jsonify({'error': f'Erro no processamento: {str(e)}'}), 500

# Endpoint para download do áudio processado
@app.route('/download/<filename>', methods=['GET'])
def download_audio(filename):
    file_path = os.path.join(PROCESSED_FOLDER, filename)
    if not os.path.exists(file_path):
        return jsonify({'error': 'Arquivo não encontrado'}), 404
    return send_file(file_path, as_attachment=True)

# Rodar o servidor Flask
if __name__ == '__main__':
    app.run(debug=True)
