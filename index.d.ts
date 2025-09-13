declare module '#app' {
  interface NuxtError {
    data: {
      status: string[]
      message: string[]
    }
  }
}

declare global {
  interface Error {
    data: {
      status: string[]
      message: string[]
    }
  }
}

export {}
