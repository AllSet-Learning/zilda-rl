var Room = function Room(x,y,w,h) {
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.maxX = x+w-1;
  this.maxY = y+h-1;
  this.centerX = Math.floor((2*x+w)/2);
  this.centerY = Math.floor((2*y+h)/2);
};
