import Svg, { Path } from 'react-native-svg';
import { BOOKMARK } from '../../constants/colors';

interface Props {
  active: boolean;
  size?: number;
}

export default function BookmarkIcon({ active, size = 22 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"
        fill={active ? BOOKMARK.active : BOOKMARK.inactive}
      />
    </Svg>
  );
}
