import React from 'react/addons';

export const Square = React.createClass({
  mixins: [React.addons.PureRenderMixin],

  getRow() {
    const rankIndex = this.props.rank - 1;
    return this.props.whiteOnBottom ? 7 - rankIndex : rankIndex;
  },

  getCol() {
    const fileIndex = this.props.file.charCodeAt(0) - 'a'.charCodeAt(0);
    return this.props.whiteOnBottom ? fileIndex : 7 - fileIndex;
  },

  getFill() {
    const squareIsBlack = (this.getRow() + this.getCol()) % 2 === 1;
    if (this.props.isSelected) {
      return '#3030ff';
    } else if (this.props.isValidSrc) {
      return squareIsBlack ? '#9090c0' : '#c0c0ff';
    } else if (this.props.isValidDst) {
      return squareIsBlack ? '#90c090' : '#c0ffc0';
    } else {
      return squareIsBlack ? '#707070' : '#f0f0f0';
    }
  },

  renderPiece() {
    const {pieceType, pieceColor, width} = this.props;
    if (pieceType) {
      const href = `images/${pieceType}-${pieceColor}.svg`;
      // TODO dangerouslySetInnerHTML is necessary due to the following issue:
      // https://github.com/facebook/react/issues/1657
      const html = `<image width="${width}" height="${width}" xlink:href="${href}"/>`;
      return <svg dangerouslySetInnerHTML={{__html: html}} />;
    }
  },

  render() {
    const width = this.props.width;
    const isClickable = this.props.isValidSrc || this.props.isValidDst;
    return (
      <svg
        x={width * this.getCol()}
        y={width * this.getRow()}
        onClick={e => this.props.onClick(this.props.index)}
        style={{cursor: isClickable ? 'pointer' : null}}
      >
        <rect width={width} height={width} fill={this.getFill()} />
        {this.renderPiece()}
      </svg>
    );
  },
});
