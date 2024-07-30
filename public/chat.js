const socket = io('http://localhost:3000');

const submitBtn = document.getElementById("submitBtn");
const username = document.getElementById("nameInput");
const message = document.getElementById("messageInput");
const imageInput = document.getElementById("imageInput");
const chatarea = document.querySelector(".chat-area ul");
const chatareaScroll = document.querySelector(".chat-area");

socket.on('load previous messages', (messages) => {
    messages.forEach(data => {
        addMessageToChatArea(data);
    })
})

submitBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (username.value) {
        if (imageInput.files.length > 0) {
            const file = imageInput.files[0];
            const reader = new FileReader();
            reader.onload = function (event) {
                const img = new Image();
                img.onload = function () {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    const maxWidth = 800; // Görselin maksimum genişliği
                    const maxHeight = 800; // Görselin maksimum yüksekliği
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > maxWidth) {
                            height = Math.round(height * maxWidth / width);
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width = Math.round(width * maxHeight / height);
                            height = maxHeight;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);
                    const imageData = canvas.toDataURL('image/jpeg');
                    socket.emit('chat', {
                        username: username.value,
                        message: message.value,
                        image: imageData
                    });
                    message.value = '';
                    imageInput.value = '';
                };
                img.src = event.target.result;
            }
            reader.readAsDataURL(file);
        } else if (message.value) {
            socket.emit('chat', {
                username: username.value,
                message: message.value,
            })
            message.value = '';
        }
    }
});

socket.on('chat', data => {
    addMessageToChatArea(data);
});

function addMessageToChatArea(data) {
    const li = document.createElement("li");
    li.classList.add('w-full');

    if (data.username && data.message && !data.image) {
        li.innerHTML = `<p class="text-[18px] font-normal text-white w-full"><span class="font-bold">${data.username}:
                            </span>${data.message}
                        </p>`;
    } else if (data.username && data.image && !data.message) {
        li.classList.add('flex', 'flex-col', 'items-start', 'gap-[14px]')
        li.innerHTML = `<p class="text-[18px] font-normal text-white w-full"><span class="font-bold">${data.username}:</span></p>
                        <img class="max-w-[200px] w-full rounded-[14px]" src="${data.image}" alt="message image">`
    } else if (data.username && data.image && data.message) {
        li.classList.add('flex', 'flex-col', 'items-start', 'gap-[14px]')
        li.innerHTML = `<p class="text-[18px] font-normal text-white w-full"><span class="font-bold">${data.username}:</span> ${data.message}</p>
                        <img class="max-w-[200px] w-full rounded-[14px]" src="${data.image}" alt="message image">`
    }
    chatarea.appendChild(li);
    setTimeout(function () {
        chatareaScroll.scrollTop = chatareaScroll.scrollHeight;
    }, 0.1);
}