import { /* getIps, */ getPrimes, Port } from './lib'
import { Env } from './env'

export class StorageDO {
	state: DurableObjectState
	env: Env

	constructor(state:DurableObjectState, env: Env) {
		this.state = state
		this.env = env
	}

	async fetch(request: Request) {
		try {
			const url = new URL(request.url)
			if (url.pathname == '/refresh') {
				/* const ips = await getIps(this.env.subsciptionId, this.env.resourceGroupName, this.env.tenantId)
				const avPorts: Port[] = []
				ips.forEach((ip) => {
					avPorts.push({ vmIP: ip, port: '25565' })
					avPorts.push({ vmIP: ip, port: '25566' })
					avPorts.push({ vmIP: ip, port: '25567' })
				}) */
				await this.state.storage.put('available', [
					{
						vmIP: '20.127.154.130',
						port: '25565'
					},
					{
						vmIP: '20.127.154.130',
						port: '25566'
					},
					{
						vmIP: '20.127.154.130',
						port: '25567'
					},
					{
						vmIP: '20.102.108.42',
						port: '25565'
					},
					{
						vmIP: '20.102.108.42',
						port: '25566'
					},
					{
						vmIP: '20.102.108.42',
						port: '25567'
					},
				])

				return new Response('Atomic storage refreshed', { status: 200 })
			}

			// Get available ports and instances
			let availablePorts = await this.state.storage.get<Port[]>('available')
			if (availablePorts === undefined) {
				return new Response('Atomic storage was not initialized', { status: 500 })
			}

			// If length is 0, it's empty, nothing to do
			if (availablePorts.length === 0) {
				return new Response('Request cannot be resolved, no more available instances.', { status: 503 })
			}

			// Same here
			const popped = availablePorts.pop()
			if (popped === undefined) {
				return new Response('Request cannot be resolved, no more available instances.', { status: 503 })
			}

			// Update atomic storage
			await this.state.storage.put('available', availablePorts)

			// Fetch VM's webapp
			const primes = await getPrimes(popped)

			// Pull atomic storage so it's up to date, then update it (put back popped value)
			availablePorts = await this.state.storage.get<Port[]>('available')
			if (availablePorts === undefined) {
				return new Response('Error - atomic storage is broken.')	// This shouldn't ever happen, but who knows?
			}
			availablePorts.push(popped)
			await this.state.storage.put('available', availablePorts)

			const ports = await this.state.storage.get('available')

			const responseString = JSON.stringify(ports) + '\n\n' + JSON.stringify(primes)

			return new Response(responseString, { status: 200 })
		} catch (error) {
			console.log('Error: ', error)
			return new Response('ERROR', { status: 500 })
		}
	}
}

// TODO holnap reggel
/*
	Create PPT/PDF/something
*/

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		try{
			// Create stub for DO
			const id = '2edfb9cff0ee2f1e5e8275a7fda69af809c572af03defbb3a583a3d8d60e187b'	// DurableObject ID
			const stub = env.STORAGE_DO.get(env.STORAGE_DO.idFromString(id))

			// Fetch DO
			const response = await stub.fetch(request)
			const returned = await response.text()

			// Return results
			return new Response(returned)
		} catch (error) {
			console.log('Error: ', error)
			return new Response('ERROR', { status: 500 })
		}
	},
}
