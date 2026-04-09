import {GetSecretValueCommand, SecretsManagerClient} from "@aws-sdk/client-secrets-manager";

const client = new SecretsManagerClient();

export const getSecret = async (secretName: string) => {
    try {
        const response = await client.send(new GetSecretValueCommand({
            SecretId: secretName
        }));

        const secretString = response.SecretString ?? null;
        return secretString ? JSON.parse(secretString): (() => { throw new Error('secret not found'); })();
    } catch (error) {
        throw new Error(`failed to retrieve secret: ${error}`);
    }
}