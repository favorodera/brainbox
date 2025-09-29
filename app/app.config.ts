export default defineAppConfig({
  ui: {
    colors: {
      primary: 'black',
      neutral: 'neutral',
    },
    formField: {
      slots: {
        label: 'font-medium',
      },
    },
    button: {
      slots: {
        base: 'cursor-pointer',
      },
    },
    dropdownMenu: {
      slots: {
        item: 'cursor-pointer',
      },
    },
    input: {
      slots: {
        root: 'w-full',
      },
    },
    inputMenu: {
      slots: {
        root: 'w-full',
      },
    },
    inputNumber: {
      slots: {
        root: 'w-full',
      },
    },
    textarea: {
      slots: {
        root: 'w-full',
        base: 'resize-none',
      },
    },
    tabs: {
      slots: {
        trigger: 'cursor-pointer',
      },
    },
    selectMenu: {
      slots: {
        base: 'cursor-pointer text-start w-full',
        item: 'cursor-pointer',
      },
    },
    select: {
      slots: {
        base: 'cursor-pointer text-start w-full',
        item: 'cursor-pointer',
      },
    },
    inputTags: {
      slots: {
        base: 'w-full',
      },
    },
    navigationMenu: {
      slots: {
        link: 'cursor-pointer',
      },
    },
    fileUpload: {
      slots: {
        base: 'cursor-pointer',
      },
    },
    toast: {
      slots: {
        root: 'bg-elevated ring-0',
      },
    },
    commandPalette: {
      slots: {
        item: 'cursor-pointer',
      },
    },
  },
})
