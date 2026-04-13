const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imgDir = path.join(__dirname, '../../img'); // Pasta img na raiz do projeto
const backupDir = path.join(__dirname, '../../img_backup');

// Cria pasta de backup
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
}

async function convertToWebP() {
    try {
        const files = fs.readdirSync(imgDir);
        let count = 0;

        for (const file of files) {
            const ext = path.extname(file).toLowerCase();
            if (['.jpg', '.jpeg', '.png'].includes(ext)) {
                const inputPath = path.join(imgDir, file);
                const filename = path.parse(file).name;
                const outputPath = path.join(imgDir, `${filename}.webp`);
                const backupPath = path.join(backupDir, file);

                console.log(`🔄 Convertendo: ${file}...`);

                // 1. Converter para WebP
                await sharp(inputPath)
                    .resize({ width: 1200, withoutEnlargement: true }) // Redimensiona se > 1200px
                    .webp({ quality: 80 }) // 80% qualidade
                    .toFile(outputPath);

                // 2. Mover original para backup (opcional, mas seguro)
                // fs.renameSync(inputPath, backupPath); 
                // OU Deletar para economizar espaço como pedido
                fs.unlinkSync(inputPath);

                console.log(`✅ Gerado: ${filename}.webp`);
                count++;
            }
        }
        console.log(`\n🎉 Concluído! ${count} imagens convertidas para WebP.`);
        console.log('Originais foram removidos para liberar espaço.');

    } catch (error) {
        console.error('❌ Erro:', error);
    }
}

convertToWebP();
