const generateMessage = (username, text) => 
{
    return {
        text,
        createdAt: new Date().getTime(),
        username
    }
}

module.exports = {
    generateMessage
}