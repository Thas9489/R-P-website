'use client'

import { useContext } from 'react'
import { SupabaseAuthContext } from '@/components/providers/SupabaseAuthProvider'

export function useUser() {
  return useContext(SupabaseAuthContext)
}
