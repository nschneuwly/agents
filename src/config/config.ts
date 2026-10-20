import * as z from 'zod'

const BasemapSchema = z.object({
	id: z.string().trim().min(1),
	label: z.string().trim().min(1),
})

export const ConfigSchema = z.object({
	portalUrl: z.url(),
	clientId: z.string().trim().min(1),
	basemaps: z.array(BasemapSchema).min(1),
})

export type Config = z.infer<typeof ConfigSchema>
