

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(client.success("SUCCESS: ") + `Logged in as ${client.user.tag}!`);
    }
}