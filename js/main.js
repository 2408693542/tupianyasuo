// 获取DOM元素
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const previewContainer = document.getElementById('previewContainer');
const originalImage = document.getElementById('originalImage');
const compressedImage = document.getElementById('compressedImage');
const originalSize = document.getElementById('originalSize');
const compressedSize = document.getElementById('compressedSize');
const qualitySlider = document.getElementById('qualitySlider');
const qualityValue = document.getElementById('qualityValue');
const downloadBtn = document.getElementById('downloadBtn');
const scaleSlider = document.getElementById('scaleSlider');
const scaleValue = document.getElementById('scaleValue');
const qualityControl = document.getElementById('qualityControl');
const scaleControl = document.getElementById('scaleControl');

// 当前处理的图片数据
let currentFile = null;
let currentMimeType = '';
let currentScale = 1;

// 初始化事件监听
function initEventListeners() {
    // 点击上传区域触发文件选择
    uploadArea.addEventListener('click', () => fileInput.click());

    // 文件选择变化时处理图片
    fileInput.addEventListener('change', handleFileSelect);

    // 拖拽相关事件
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#0071e3';
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = '#c7c7c7';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#c7c7c7';
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });

    // 质量滑块变化时重新压缩
    qualitySlider.addEventListener('input', (e) => {
        qualityValue.textContent = `${e.target.value}%`;
        if (currentFile && currentMimeType.startsWith('image/jpeg')) {
            compressImage(currentFile, e.target.value / 100, 1);
        }
    });

    // 缩放滑块变化时重新压缩
    scaleSlider.addEventListener('input', (e) => {
        scaleValue.textContent = `${e.target.value}%`;
        currentScale = e.target.value / 100;
        if (currentFile && currentMimeType === 'image/png') {
            compressImage(currentFile, 1, currentScale);
        }
    });

    // 下载按钮点击事件
    downloadBtn.addEventListener('click', downloadCompressedImage);
}

// 处理文件选择
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
}

// 处理文件
function handleFile(file) {
    if (!file.type.match('image.*')) {
        alert('请选择图片文件！');
        return;
    }
    currentFile = file;
    currentMimeType = file.type;
    const reader = new FileReader();
    reader.onload = (e) => {
        originalImage.src = e.target.result;
        originalSize.textContent = formatFileSize(file.size);
        previewContainer.style.display = 'block';
        // 判断类型，切换滑块
        if (file.type === 'image/png') {
            qualityControl.style.display = 'none';
            scaleControl.style.display = 'block';
            scaleSlider.value = 100;
            scaleValue.textContent = '100%';
            currentScale = 1;
            compressImage(file, 1, 1);
        } else {
            qualityControl.style.display = 'block';
            scaleControl.style.display = 'none';
            compressImage(file, qualitySlider.value / 100, 1);
        }
    };
    reader.readAsDataURL(file);
}

// 压缩图片
function compressImage(file, quality = 1, scale = 1) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            // PNG支持缩放
            if (file.type === 'image/png') {
                canvas.width = Math.round(img.width * scale);
                canvas.height = Math.round(img.height * scale);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                canvas.toBlob((blob) => {
                    compressedImage.src = URL.createObjectURL(blob);
                    compressedSize.textContent = formatFileSize(blob.size);
                }, file.type);
            } else {
                // JPG/JPEG
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                canvas.toBlob((blob) => {
                    compressedImage.src = URL.createObjectURL(blob);
                    compressedSize.textContent = formatFileSize(blob.size);
                }, file.type, quality);
            }
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// 下载压缩后的图片
function downloadCompressedImage() {
    const link = document.createElement('a');
    link.download = `compressed_${currentFile.name}`;
    link.href = compressedImage.src;
    link.click();
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 初始化应用
initEventListeners(); 