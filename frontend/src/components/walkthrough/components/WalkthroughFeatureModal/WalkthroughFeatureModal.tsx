import CustomModal from '../../../Modal/index';
import CustomButton from 'components/Button';
import Sidebar from '../SideBar/Sidebar'

interface IWalkthroughFeatureModal {
  openModal: boolean;
  onClose: ()=>void;
  featureSteps: Array<Type>;
}
interface Type{
  label: string;
}
const WalkthroughFeatureModal = ({
  openModal,
  onClose,
  featureSteps
}: IWalkthroughFeatureModal) => {
  return (
    <CustomModal
          title='Features'
          open={openModal}
          onClose={onClose}
          aria-labelledby='Walthrough Feature Modal'
          aria-describedby='Walthrough Feature Modal'
          fullWidth
          maxWidth='xl'
          actionbuttons={
            <CustomButton onClick={onClose} variant='outlined'>
                Cancel
            </CustomButton>
          }
        >
          <Sidebar/>
        </CustomModal>
  )
}

export default WalkthroughFeatureModal 