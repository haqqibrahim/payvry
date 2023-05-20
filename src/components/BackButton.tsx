import { ExtraStyle } from '../interfaces';

interface Props {
  onClick?: () => void;
  extraStyles?: ExtraStyle;
}

const BackButton: React.FC<Props> = ({ onClick, extraStyles }) => {
  return (
    <button
      onClick={() => {
        window.history.back();
        if (onClick) onClick();
      }}
      style={extraStyles}
      className='absolute top-[54px] left-[15px] bg-[url(./assets/svgs/caret-left.svg)] bg-center bg-no-repeat w-[30px] h-[30px] rounded-[60px] bg-athens-gray'
    />
  );
};

export default BackButton;
