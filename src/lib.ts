import { InteractiveBrowserCredential } from '@azure/identity'
import { MonitorClient } from '@azure/arm-monitor'
import { ComputeManagementClient } from '@azure/arm-compute'
import { NetworkManagementClient } from '@azure/arm-network'

export type Port = {
	vmIP: string,
	port: string
}

/* export async function getVmMetrics(subscriptionId: string, resourceGroupName: string, vmName: string, interval: number,tenantId: string) {
  const monitorClient = new MonitorClient(new InteractiveBrowserCredential({ tenantId: tenantId }), subscriptionId)
  const resourceUri = `/subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.Compute/virtualMachines/${vmName}`

  const endDate = new Date()
  const startDate = new Date(endDate.getTime() - interval)

  const metrics = await monitorClient.metrics.list(resourceUri, {
    timespan: `${startDate.toISOString()}/${endDate.toISOString()}`,
    interval: 'PT1M',  // 1-minute interval
    metricnames: 'Percentage CPU',
  })

  return metrics
} */


/* export async function getIps(subscriptionId: string, resourceGroupName: string, tenantId: string): Promise<string[]> {
	const computeClient = new ComputeManagementClient(new InteractiveBrowserCredential({ tenantId: tenantId }), subscriptionId)
	const networkClient = new NetworkManagementClient(new InteractiveBrowserCredential({ tenantId: tenantId }), subscriptionId)
	try {
		const vmsIterator = computeClient.virtualMachines.list(resourceGroupName)
		const vmNames: string[] = []

		for await (const vm of vmsIterator) {
			if (vm.name !== undefined) vmNames.push(vm.name)
		}

		const vmIps: string[] = []

		vmNames.forEach(async (vmName) => {
			const vm = await computeClient.virtualMachines.get(resourceGroupName, vmName)
			if (vm.networkProfile && vm.networkProfile.networkInterfaces && vm.networkProfile.networkInterfaces.length > 0 && vm.networkProfile.networkInterfaces[0].id) {
				const networkInterfaceId = vm.networkProfile.networkInterfaces[0].id
				const networkInterface = await networkClient.networkInterfaces.get(resourceGroupName, networkInterfaceId.split("/")[8])

				if (networkInterface.ipConfigurations && networkInterface.ipConfigurations.length > 0 && networkInterface.ipConfigurations[0].publicIPAddress) {
					const publicIpAddressId = networkInterface.ipConfigurations[0].publicIPAddress.id
					if (publicIpAddressId === undefined) return
					const publicIpAddress = await networkClient.publicIPAddresses.get(resourceGroupName, publicIpAddressId.split("/")[8])

					if (publicIpAddress.ipAddress !== undefined) vmIps.push(publicIpAddress.ipAddress)
				}
			}
		})

		console.log(vmIps)
		return vmIps

	} catch (error) {
		console.log('ERROR - ', error)
		throw new Error('Could not retrieve IP addresses')
	}
}
*/

export async function getPrimes(port: Port): Promise<{ primes: number[] }> {
  let response = await fetch(`http://${port.vmIP}:${port.port}`, {
    method: 'GET'
  })
  let primes = await response.json() as { primes: number[] }
	return primes
}
