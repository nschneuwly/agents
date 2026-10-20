import { tool } from '@langchain/core/tools'
import z from 'zod'

const EARTH_RADIUS_KM = 6371.0088

// Example tool for calculating the distance between two geographic coordinates
const coordinateSchema = z.object({
	latitude: z.number().min(-90).max(90).describe('Latitude in WGS84 decimal degrees'),
	longitude: z.number().min(-180).max(180).describe('Longitude in WGS84 decimal degrees'),
})

const toRadians = (deg: number) => (deg * Math.PI) / 180

// The description and schema are what the LLM sees to decide when and how to call the tool.
export const calculateDistanceTool = tool(
	async ({ from, to }) => {
		const dLat = toRadians(to.latitude - from.latitude)
		const dLon = toRadians(to.longitude - from.longitude)
		const a =
			Math.sin(dLat / 2) ** 2 +
			Math.cos(toRadians(from.latitude)) * Math.cos(toRadians(to.latitude)) * Math.sin(dLon / 2) ** 2
		const distanceKm = 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a))

		return JSON.stringify({ distanceKm: Number(distanceKm.toFixed(3)) })
	},
	{
		name: 'calculate_distance',
		description:
			'Calculates the great-circle distance in kilometers between two WGS84 coordinates. Use when the user asks how far apart two places are.',
		schema: z.object({
			from: coordinateSchema.describe('Start coordinate'),
			to: coordinateSchema.describe('End coordinate'),
		}),
	},
)


