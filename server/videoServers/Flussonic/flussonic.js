export default class Flussonic {
    constructor(config) {
        this.host = config.host;
        this.urlBase = config.host + config.path; //'/vsaas/api/v2/'  '/streamer/api/v3/'
        this.login = config.username;
        this.password = config.password;

        this.timeout = 4;

        this.authHeader = null;
        // this.authHeader = {'x-vsaas-api-key': "5fa4c6f7997954170fe0b8229f8912c8"};
    }

    async #getAuthHeader() {
        const url = this.#getFullUrl('auth/login');
        const params = {
            method: "POST",
            body: JSON.stringify({ login: this.login, password: this.password })
        }

        const data = await this.#doRequest(url, params, false);
        return { 'x-vsaas-session': data.session };
    }

    async logIn(login, password) {
        this.login = login
        this.password = password

        const url = this.#getFullUrl('auth/login');
        const params = {
            method: "POST",
            body: JSON.stringify({ login: this.login, password: this.password })
        }

        const data = await this.#doRequest(url, params, false);

        return data
    }

    async #doRequest(url, params = {}, needAuth = true) {
        try {
            if (!this.authHeader && needAuth) {
                this.authHeader = await this.#getAuthHeader();
            }
            if (needAuth)
                params = { ...params, headers: this.authHeader }

            return await $fetch(url, params);
        } catch (e) {
            console.log(e)
        }

    }

    #getFullUrl(...parts) {
        return this.urlBase + parts.join('/');
    }

    async getAll(name, filter = {}) {
        const queryParams = new URLSearchParams();

        for (const [key, value] of Object.entries(filter)) {
            if (value !== undefined && value !== null && value !== '' && value !== 'false') {
                queryParams.append(key, value);
            }
        }

        const url = this.#getFullUrl(name) + (queryParams.toString() ? `?${queryParams.toString()}` : '');

        console.log(url)
        const data = await this.#doRequest(url);

        if (name === 'cameras') {
            data.forEach(s => {
                const token = s.playback_config.token;
                s.previewUrl = `${this.host}/${s.name}/preview.jpg?token=${token}`;
                s.videoUrl = `${this.host}/${s.name}/index.m3u8?token=${token}`;
                // s.streamUrl = `${s.stream_url}?token=${token}`
            });
        }

        // console.log(data)

        return data;
    }

    async getStreamById(streamName) {
        const url = this.#getFullUrl('cameras', streamName);
        const stream = await this.#doRequest(url);

        if (stream) {
            const token = stream.playback_config.token;
            stream.previewUrl = `${this.host}/${stream.name}/preview.jpg?token=${token}`;
            stream.videoUrl = `${this.host}/${stream.name}/index.m3u8?token=${token}`;
            // stream.streamUrl = `${stream.stream_url}?token=${token}`
        }

        return stream;
    }

    async updateStreamById(streamName, updateData) {
        const url = this.#getFullUrl('cameras', streamName);

        const params = {
            method: 'PUT',
            body: JSON.stringify(updateData),
            headers: {
                'Content-Type': 'application/json',
            }
        };

        const updatedStream = await this.#doRequest(url, params);

        // Обновление URL для предварительного просмотра и видео (если они есть в ответе)
        if (updatedStream) {
            const token = updatedStream.playback_config.token;
            updatedStream.previewUrl = `${this.host}/${updatedStream.name}/preview.jpg?token=${token}`;
            updatedStream.videoUrl = `${this.host}/${updatedStream.name}/index.m3u8?token=${token}`;
        }

        return updatedStream;
    }

    async deleteStreamById(streamName) {
        const url = this.#getFullUrl('cameras', streamName)

        const params = {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        }

        const response = await this.#doRequest(url, params)

        return response;
    }

    async getProfileInfo() {
        const url = this.#getFullUrl('profile')

        const profileInfo = await this.#doRequest(url)

        return profileInfo
    }

    async updateProfileInfo(newData) {
        const url = this.#getFullUrl('profile')

        const params = {
            method: 'PUT',
            body: JSON.stringify(newData),
            headers: {
                'Content-Type': 'application/json',
            }
        }

        const updatedProfileInfo = await this.#doRequest(url, params)

        return updatedProfileInfo
    }   
}