import { titleCase } from '../../utils/format';

/** Status pill. The class carries the colour, so status names stay data. */
export default function Tag({ status, children }) {
  return <span className={`tag tag--${status}`}>{children || titleCase(status)}</span>;
}
