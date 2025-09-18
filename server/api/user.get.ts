import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {

  try {
    const serverClient = await serverSupabaseClient<Database>(event)
  
    const user = await serverSupabaseUser(event)

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'UNAUTHORIZED',
        message: 'Unauthorized',
      })
    }

    const { error, data } = await serverClient
      .from('users')
      .select('name, avatar, email')
      .eq('id', user.id)
      .single()

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: error.code,
        message: error.message,
      })
    }
    
    return data

  } catch (error) {
    return getError(error)
  }
})
