function postReply() {
    let replyInput = document.getElementById('replyInput');
    if (replyInput.value.trim() !== "") {
        alert("Reply posted: " + replyInput.value);
        replyInput.value = "";
    }
}
