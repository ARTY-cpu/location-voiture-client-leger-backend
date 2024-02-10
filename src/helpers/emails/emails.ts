export const Emails = {
    Contact: (name: string, email: string, message: string) => {
        return `New contact form submission from ${name} (${email})\n\n${message}`;
    }
}