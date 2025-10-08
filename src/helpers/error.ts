import { useSnackbar } from '../composables/Snackbar.ts'

export const handleError = (e: any, growl: boolean = false) => {
  if (growl) {
    const { showErrorSnackbar } = useSnackbar()
    showErrorSnackbar({ title: 'Error', body: e })
  } else {
    console.error(e)
  }
}
