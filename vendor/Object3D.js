const _lut = [];
for ( let i = 0; i < 256; i ++ ) {
	_lut[ i ] = ( i < 16 ? '0' : '' ) + ( i ).toString( 16 );
}
let _seed = 1234567;
const MathUtils = {
	DEG2RAD: Math.PI / 180,
	RAD2DEG: 180 / Math.PI,
	generateUUID: function () {
		const d0 = Math.random() * 0xffffffff | 0;
		const d1 = Math.random() * 0xffffffff | 0;
		const d2 = Math.random() * 0xffffffff | 0;
		const d3 = Math.random() * 0xffffffff | 0;
		const uuid = _lut[ d0 & 0xff ] + _lut[ d0 >> 8 & 0xff ] + _lut[ d0 >> 16 & 0xff ] + _lut[ d0 >> 24 & 0xff ] + '-' +
			_lut[ d1 & 0xff ] + _lut[ d1 >> 8 & 0xff ] + '-' + _lut[ d1 >> 16 & 0x0f | 0x40 ] + _lut[ d1 >> 24 & 0xff ] + '-' +
			_lut[ d2 & 0x3f | 0x80 ] + _lut[ d2 >> 8 & 0xff ] + '-' + _lut[ d2 >> 16 & 0xff ] + _lut[ d2 >> 24 & 0xff ] +
			_lut[ d3 & 0xff ] + _lut[ d3 >> 8 & 0xff ] + _lut[ d3 >> 16 & 0xff ] + _lut[ d3 >> 24 & 0xff ];
		return uuid.toUpperCase();
	},
	clamp: function ( value, min, max ) {
		return Math.max( min, Math.min( max, value ) );
	},
	euclideanModulo: function ( n, m ) {
		return ( ( n % m ) + m ) % m;
	},
	mapLinear: function ( x, a1, a2, b1, b2 ) {
		return b1 + ( x - a1 ) * ( b2 - b1 ) / ( a2 - a1 );
	},
	lerp: function ( x, y, t ) {
		return ( 1 - t ) * x + t * y;
	},
	smoothstep: function ( x, min, max ) {
		if ( x <= min ) return 0;
		if ( x >= max ) return 1;
		x = ( x - min ) / ( max - min );
		return x * x * ( 3 - 2 * x );
	},
	smootherstep: function ( x, min, max ) {
		if ( x <= min ) return 0;
		if ( x >= max ) return 1;
		x = ( x - min ) / ( max - min );
		return x * x * x * ( x * ( x * 6 - 15 ) + 10 );
	},
	randInt: function ( low, high ) {
		return low + Math.floor( Math.random() * ( high - low + 1 ) );
	},
	randFloat: function ( low, high ) {
		return low + Math.random() * ( high - low );
	},
	randFloatSpread: function ( range ) {
		return range * ( 0.5 - Math.random() );
	},
	seededRandom: function ( s ) {
		if ( s !== undefined ) _seed = s % 2147483647;
		_seed = _seed * 16807 % 2147483647;
		return ( _seed - 1 ) / 2147483646;
	},
	degToRad: function ( degrees ) {
		return degrees * MathUtils.DEG2RAD;
	},
	radToDeg: function ( radians ) {
		return radians * MathUtils.RAD2DEG;
	},
	isPowerOfTwo: function ( value ) {
		return ( value & ( value - 1 ) ) === 0 && value !== 0;
	},
	ceilPowerOfTwo: function ( value ) {
		return Math.pow( 2, Math.ceil( Math.log( value ) / Math.LN2 ) );
	},
	floorPowerOfTwo: function ( value ) {
		return Math.pow( 2, Math.floor( Math.log( value ) / Math.LN2 ) );
	},
	setQuaternionFromProperEuler: function ( q, a, b, c, order ) {
		const cos = Math.cos;
		const sin = Math.sin;
		const c2 = cos( b / 2 );
		const s2 = sin( b / 2 );
		const c13 = cos( ( a + c ) / 2 );
		const s13 = sin( ( a + c ) / 2 );
		const c1_3 = cos( ( a - c ) / 2 );
		const s1_3 = sin( ( a - c ) / 2 );
		const c3_1 = cos( ( c - a ) / 2 );
		const s3_1 = sin( ( c - a ) / 2 );
		switch ( order ) {
			case 'XYX':
				q.set( c2 * s13, s2 * c1_3, s2 * s1_3, c2 * c13 );
				break;
			case 'YZY':
				q.set( s2 * s1_3, c2 * s13, s2 * c1_3, c2 * c13 );
				break;
			case 'ZXZ':
				q.set( s2 * c1_3, s2 * s1_3, c2 * s13, c2 * c13 );
				break;
			case 'XZX':
				q.set( c2 * s13, s2 * s3_1, s2 * c3_1, c2 * c13 );
				break;
			case 'YXY':
				q.set( s2 * c3_1, c2 * s13, s2 * s3_1, c2 * c13 );
				break;
			case 'ZYZ':
				q.set( s2 * s3_1, s2 * c3_1, c2 * s13, c2 * c13 );
				break;
			default:
				console.warn( 'THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: ' + order );
		}
	}
};

class Quaternion {
	constructor( x = 0, y = 0, z = 0, w = 1 ) {
		Object.defineProperty( this, 'isQuaternion', { value: true } );
		this._x = x;
		this._y = y;
		this._z = z;
		this._w = w;
	}
	static slerp( qa, qb, qm, t ) {
		return qm.copy( qa ).slerp( qb, t );
	}
	static slerpFlat( dst, dstOffset, src0, srcOffset0, src1, srcOffset1, t ) {
		let x0 = src0[ srcOffset0 + 0 ],
			y0 = src0[ srcOffset0 + 1 ],
			z0 = src0[ srcOffset0 + 2 ],
			w0 = src0[ srcOffset0 + 3 ];
		const x1 = src1[ srcOffset1 + 0 ],
			y1 = src1[ srcOffset1 + 1 ],
			z1 = src1[ srcOffset1 + 2 ],
			w1 = src1[ srcOffset1 + 3 ];
		if ( w0 !== w1 || x0 !== x1 || y0 !== y1 || z0 !== z1 ) {
			let s = 1 - t;
			const cos = x0 * x1 + y0 * y1 + z0 * z1 + w0 * w1,
				dir = ( cos >= 0 ? 1 : - 1 ),
				sqrSin = 1 - cos * cos;
			if ( sqrSin > Number.EPSILON ) {
				const sin = Math.sqrt( sqrSin ),
					len = Math.atan2( sin, cos * dir );
				s = Math.sin( s * len ) / sin;
				t = Math.sin( t * len ) / sin;
			}
			const tDir = t * dir;
			x0 = x0 * s + x1 * tDir;
			y0 = y0 * s + y1 * tDir;
			z0 = z0 * s + z1 * tDir;
			w0 = w0 * s + w1 * tDir;
			if ( s === 1 - t ) {
				const f = 1 / Math.sqrt( x0 * x0 + y0 * y0 + z0 * z0 + w0 * w0 );
				x0 *= f;
				y0 *= f;
				z0 *= f;
				w0 *= f;
			}
		}
		dst[ dstOffset ] = x0;
		dst[ dstOffset + 1 ] = y0;
		dst[ dstOffset + 2 ] = z0;
		dst[ dstOffset + 3 ] = w0;
	}
	static multiplyQuaternionsFlat( dst, dstOffset, src0, srcOffset0, src1, srcOffset1 ) {
		const x0 = src0[ srcOffset0 ];
		const y0 = src0[ srcOffset0 + 1 ];
		const z0 = src0[ srcOffset0 + 2 ];
		const w0 = src0[ srcOffset0 + 3 ];
		const x1 = src1[ srcOffset1 ];
		const y1 = src1[ srcOffset1 + 1 ];
		const z1 = src1[ srcOffset1 + 2 ];
		const w1 = src1[ srcOffset1 + 3 ];
		dst[ dstOffset ] = x0 * w1 + w0 * x1 + y0 * z1 - z0 * y1;
		dst[ dstOffset + 1 ] = y0 * w1 + w0 * y1 + z0 * x1 - x0 * z1;
		dst[ dstOffset + 2 ] = z0 * w1 + w0 * z1 + x0 * y1 - y0 * x1;
		dst[ dstOffset + 3 ] = w0 * w1 - x0 * x1 - y0 * y1 - z0 * z1;
		return dst;
	}
	get x() {
		return this._x;
	}
	set x( value ) {
		this._x = value;
		this._onChangeCallback();
	}
	get y() {
		return this._y;
	}
	set y( value ) {
		this._y = value;
		this._onChangeCallback();
	}
	get z() {
		return this._z;
	}
	set z( value ) {
		this._z = value;
		this._onChangeCallback();
	}
	get w() {
		return this._w;
	}
	set w( value ) {
		this._w = value;
		this._onChangeCallback();
	}
	set( x, y, z, w ) {
		this._x = x;
		this._y = y;
		this._z = z;
		this._w = w;
		this._onChangeCallback();
		return this;
	}
	clone() {
		return new this.constructor( this._x, this._y, this._z, this._w );
	}
	copy( quaternion ) {
		this._x = quaternion.x;
		this._y = quaternion.y;
		this._z = quaternion.z;
		this._w = quaternion.w;
		this._onChangeCallback();
		return this;
	}
	setFromEuler( euler, update ) {
		if ( ! ( euler && euler.isEuler ) ) {
			throw new Error( 'THREE.Quaternion: .setFromEuler() now expects an Euler rotation rather than a Vector3 and order.' );
		}
		const x = euler._x, y = euler._y, z = euler._z, order = euler._order;
		const cos = Math.cos;
		const sin = Math.sin;
		const c1 = cos( x / 2 );
		const c2 = cos( y / 2 );
		const c3 = cos( z / 2 );
		const s1 = sin( x / 2 );
		const s2 = sin( y / 2 );
		const s3 = sin( z / 2 );
		switch ( order ) {
			case 'XYZ':
				this._x = s1 * c2 * c3 + c1 * s2 * s3;
				this._y = c1 * s2 * c3 - s1 * c2 * s3;
				this._z = c1 * c2 * s3 + s1 * s2 * c3;
				this._w = c1 * c2 * c3 - s1 * s2 * s3;
				break;
			case 'YXZ':
				this._x = s1 * c2 * c3 + c1 * s2 * s3;
				this._y = c1 * s2 * c3 - s1 * c2 * s3;
				this._z = c1 * c2 * s3 - s1 * s2 * c3;
				this._w = c1 * c2 * c3 + s1 * s2 * s3;
				break;
			case 'ZXY':
				this._x = s1 * c2 * c3 - c1 * s2 * s3;
				this._y = c1 * s2 * c3 + s1 * c2 * s3;
				this._z = c1 * c2 * s3 + s1 * s2 * c3;
				this._w = c1 * c2 * c3 - s1 * s2 * s3;
				break;
			case 'ZYX':
				this._x = s1 * c2 * c3 - c1 * s2 * s3;
				this._y = c1 * s2 * c3 + s1 * c2 * s3;
				this._z = c1 * c2 * s3 - s1 * s2 * c3;
				this._w = c1 * c2 * c3 + s1 * s2 * s3;
				break;
			case 'YZX':
				this._x = s1 * c2 * c3 + c1 * s2 * s3;
				this._y = c1 * s2 * c3 + s1 * c2 * s3;
				this._z = c1 * c2 * s3 - s1 * s2 * c3;
				this._w = c1 * c2 * c3 - s1 * s2 * s3;
				break;
			case 'XZY':
				this._x = s1 * c2 * c3 - c1 * s2 * s3;
				this._y = c1 * s2 * c3 - s1 * c2 * s3;
				this._z = c1 * c2 * s3 + s1 * s2 * c3;
				this._w = c1 * c2 * c3 + s1 * s2 * s3;
				break;
			default:
				console.warn( 'THREE.Quaternion: .setFromEuler() encountered an unknown order: ' + order );
		}
		if ( update !== false ) this._onChangeCallback();
		return this;
	}
	setFromAxisAngle( axis, angle ) {
		const halfAngle = angle / 2, s = Math.sin( halfAngle );
		this._x = axis.x * s;
		this._y = axis.y * s;
		this._z = axis.z * s;
		this._w = Math.cos( halfAngle );
		this._onChangeCallback();
		return this;
	}
	setFromRotationMatrix( m ) {
		const te = m.elements,
			m11 = te[ 0 ], m12 = te[ 4 ], m13 = te[ 8 ],
			m21 = te[ 1 ], m22 = te[ 5 ], m23 = te[ 9 ],
			m31 = te[ 2 ], m32 = te[ 6 ], m33 = te[ 10 ],
			trace = m11 + m22 + m33;
		if ( trace > 0 ) {
			const s = 0.5 / Math.sqrt( trace + 1.0 );
			this._w = 0.25 / s;
			this._x = ( m32 - m23 ) * s;
			this._y = ( m13 - m31 ) * s;
			this._z = ( m21 - m12 ) * s;
		} else if ( m11 > m22 && m11 > m33 ) {
			const s = 2.0 * Math.sqrt( 1.0 + m11 - m22 - m33 );
			this._w = ( m32 - m23 ) / s;
			this._x = 0.25 * s;
			this._y = ( m12 + m21 ) / s;
			this._z = ( m13 + m31 ) / s;
		} else if ( m22 > m33 ) {
			const s = 2.0 * Math.sqrt( 1.0 + m22 - m11 - m33 );
			this._w = ( m13 - m31 ) / s;
			this._x = ( m12 + m21 ) / s;
			this._y = 0.25 * s;
			this._z = ( m23 + m32 ) / s;
		} else {
			const s = 2.0 * Math.sqrt( 1.0 + m33 - m11 - m22 );
			this._w = ( m21 - m12 ) / s;
			this._x = ( m13 + m31 ) / s;
			this._y = ( m23 + m32 ) / s;
			this._z = 0.25 * s;
		}
		this._onChangeCallback();
		return this;
	}
	setFromUnitVectors( vFrom, vTo ) {
		const EPS = 0.000001;
		let r = vFrom.dot( vTo ) + 1;
		if ( r < EPS ) {
			r = 0;
			if ( Math.abs( vFrom.x ) > Math.abs( vFrom.z ) ) {
				this._x = - vFrom.y;
				this._y = vFrom.x;
				this._z = 0;
				this._w = r;
			} else {
				this._x = 0;
				this._y = - vFrom.z;
				this._z = vFrom.y;
				this._w = r;
			}
		} else {
			this._x = vFrom.y * vTo.z - vFrom.z * vTo.y;
			this._y = vFrom.z * vTo.x - vFrom.x * vTo.z;
			this._z = vFrom.x * vTo.y - vFrom.y * vTo.x;
			this._w = r;
		}
		return this.normalize();
	}
	angleTo( q ) {
		return 2 * Math.acos( Math.abs( MathUtils.clamp( this.dot( q ), - 1, 1 ) ) );
	}
	rotateTowards( q, step ) {
		const angle = this.angleTo( q );
		if ( angle === 0 ) return this;
		const t = Math.min( 1, step / angle );
		this.slerp( q, t );
		return this;
	}
	identity() {
		return this.set( 0, 0, 0, 1 );
	}
	inverse() {
		return this.conjugate();
	}
	conjugate() {
		this._x *= - 1;
		this._y *= - 1;
		this._z *= - 1;
		this._onChangeCallback();
		return this;
	}
	dot( v ) {
		return this._x * v._x + this._y * v._y + this._z * v._z + this._w * v._w;
	}
	lengthSq() {
		return this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w;
	}
	length() {
		return Math.sqrt( this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w );
	}
	normalize() {
		let l = this.length();
		if ( l === 0 ) {
			this._x = 0;
			this._y = 0;
			this._z = 0;
			this._w = 1;
		} else {
			l = 1 / l;
			this._x = this._x * l;
			this._y = this._y * l;
			this._z = this._z * l;
			this._w = this._w * l;
		}
		this._onChangeCallback();
		return this;
	}
	multiply( q, p ) {
		if ( p !== undefined ) {
			console.warn( 'THREE.Quaternion: .multiply() now only accepts one argument. Use .multiplyQuaternions( a, b ) instead.' );
			return this.multiplyQuaternions( q, p );
		}
		return this.multiplyQuaternions( this, q );
	}
	premultiply( q ) {
		return this.multiplyQuaternions( q, this );
	}
	multiplyQuaternions( a, b ) {
		const qax = a._x, qay = a._y, qaz = a._z, qaw = a._w;
		const qbx = b._x, qby = b._y, qbz = b._z, qbw = b._w;
		this._x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
		this._y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
		this._z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
		this._w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;
		this._onChangeCallback();
		return this;
	}
	slerp( qb, t ) {
		if ( t === 0 ) return this;
		if ( t === 1 ) return this.copy( qb );
		const x = this._x, y = this._y, z = this._z, w = this._w;
		let cosHalfTheta = w * qb._w + x * qb._x + y * qb._y + z * qb._z;
		if ( cosHalfTheta < 0 ) {
			this._w = - qb._w;
			this._x = - qb._x;
			this._y = - qb._y;
			this._z = - qb._z;
			cosHalfTheta = - cosHalfTheta;
		} else {
			this.copy( qb );
		}
		if ( cosHalfTheta >= 1.0 ) {
			this._w = w;
			this._x = x;
			this._y = y;
			this._z = z;
			return this;
		}
		const sqrSinHalfTheta = 1.0 - cosHalfTheta * cosHalfTheta;
		if ( sqrSinHalfTheta <= Number.EPSILON ) {
			const s = 1 - t;
			this._w = s * w + t * this._w;
			this._x = s * x + t * this._x;
			this._y = s * y + t * this._y;
			this._z = s * z + t * this._z;
			this.normalize();
			this._onChangeCallback();
			return this;
		}
		const sinHalfTheta = Math.sqrt( sqrSinHalfTheta );
		const halfTheta = Math.atan2( sinHalfTheta, cosHalfTheta );
		const ratioA = Math.sin( ( 1 - t ) * halfTheta ) / sinHalfTheta,
			ratioB = Math.sin( t * halfTheta ) / sinHalfTheta;
		this._w = ( w * ratioA + this._w * ratioB );
		this._x = ( x * ratioA + this._x * ratioB );
		this._y = ( y * ratioA + this._y * ratioB );
		this._z = ( z * ratioA + this._z * ratioB );
		this._onChangeCallback();
		return this;
	}
	equals( quaternion ) {
		return ( quaternion._x === this._x ) && ( quaternion._y === this._y ) && ( quaternion._z === this._z ) && ( quaternion._w === this._w );
	}
	fromArray( array, offset ) {
		if ( offset === undefined ) offset = 0;
		this._x = array[ offset ];
		this._y = array[ offset + 1 ];
		this._z = array[ offset + 2 ];
		this._w = array[ offset + 3 ];
		this._onChangeCallback();
		return this;
	}
	toArray( array, offset ) {
		if ( array === undefined ) array = [];
		if ( offset === undefined ) offset = 0;
		array[ offset ] = this._x;
		array[ offset + 1 ] = this._y;
		array[ offset + 2 ] = this._z;
		array[ offset + 3 ] = this._w;
		return array;
	}
	fromBufferAttribute( attribute, index ) {
		this._x = attribute.getX( index );
		this._y = attribute.getY( index );
		this._z = attribute.getZ( index );
		this._w = attribute.getW( index );
		return this;
	}
	_onChange( callback ) {
		this._onChangeCallback = callback;
		return this;
	}
	_onChangeCallback() {}
}

class Vector3 {
	constructor( x = 0, y = 0, z = 0 ) {
		Object.defineProperty( this, 'isVector3', { value: true } );
		this.x = x;
		this.y = y;
		this.z = z;
	}
	set( x, y, z ) {
		if ( z === undefined ) z = this.z;
		this.x = x;
		this.y = y;
		this.z = z;
		return this;
	}
	setScalar( scalar ) {
		this.x = scalar;
		this.y = scalar;
		this.z = scalar;
		return this;
	}
	setX( x ) {
		this.x = x;
		return this;
	}
	setY( y ) {
		this.y = y;
		return this;
	}
	setZ( z ) {
		this.z = z;
		return this;
	}
	setComponent( index, value ) {
		switch ( index ) {
			case 0: this.x = value; break;
			case 1: this.y = value; break;
			case 2: this.z = value; break;
			default: throw new Error( 'index is out of range: ' + index );
		}
		return this;
	}
	getComponent( index ) {
		switch ( index ) {
			case 0: return this.x;
			case 1: return this.y;
			case 2: return this.z;
			default: throw new Error( 'index is out of range: ' + index );
		}
	}
	clone() {
		return new this.constructor( this.x, this.y, this.z );
	}
	copy( v ) {
		this.x = v.x;
		this.y = v.y;
		this.z = v.z;
		return this;
	}
	add( v, w ) {
		if ( w !== undefined ) {
			console.warn( 'THREE.Vector3: .add() now only accepts one argument. Use .addVectors( a, b ) instead.' );
			return this.addVectors( v, w );
		}
		this.x += v.x;
		this.y += v.y;
		this.z += v.z;
		return this;
	}
	addScalar( s ) {
		this.x += s;
		this.y += s;
		this.z += s;
		return this;
	}
	addVectors( a, b ) {
		this.x = a.x + b.x;
		this.y = a.y + b.y;
		this.z = a.z + b.z;
		return this;
	}
	addScaledVector( v, s ) {
		this.x += v.x * s;
		this.y += v.y * s;
		this.z += v.z * s;
		return this;
	}
	sub( v, w ) {
		if ( w !== undefined ) {
			console.warn( 'THREE.Vector3: .sub() now only accepts one argument. Use .subVectors( a, b ) instead.' );
			return this.subVectors( v, w );
		}
		this.x -= v.x;
		this.y -= v.y;
		this.z -= v.z;
		return this;
	}
	subScalar( s ) {
		this.x -= s;
		this.y -= s;
		this.z -= s;
		return this;
	}
	subVectors( a, b ) {
		this.x = a.x - b.x;
		this.y = a.y - b.y;
		this.z = a.z - b.z;
		return this;
	}
	multiply( v, w ) {
		if ( w !== undefined ) {
			console.warn( 'THREE.Vector3: .multiply() now only accepts one argument. Use .multiplyVectors( a, b ) instead.' );
			return this.multiplyVectors( v, w );
		}
		this.x *= v.x;
		this.y *= v.y;
		this.z *= v.z;
		return this;
	}
	multiplyScalar( scalar ) {
		this.x *= scalar;
		this.y *= scalar;
		this.z *= scalar;
		return this;
	}
	multiplyVectors( a, b ) {
		this.x = a.x * b.x;
		this.y = a.y * b.y;
		this.z = a.z * b.z;
		return this;
	}
	applyEuler( euler ) {
		if ( ! ( euler && euler.isEuler ) ) {
			console.error( 'THREE.Vector3: .applyEuler() now expects an Euler rotation rather than a Vector3 and order.' );
		}
		return this.applyQuaternion( _quaternion$2.setFromEuler( euler ) );
	}
	applyAxisAngle( axis, angle ) {
		return this.applyQuaternion( _quaternion$2.setFromAxisAngle( axis, angle ) );
	}
	applyMatrix3( m ) {
		const x = this.x, y = this.y, z = this.z;
		const e = m.elements;
		this.x = e[ 0 ] * x + e[ 3 ] * y + e[ 6 ] * z;
		this.y = e[ 1 ] * x + e[ 4 ] * y + e[ 7 ] * z;
		this.z = e[ 2 ] * x + e[ 5 ] * y + e[ 8 ] * z;
		return this;
	}
	applyNormalMatrix( m ) {
		return this.applyMatrix3( m ).normalize();
	}
	applyMatrix4( m ) {
		const x = this.x, y = this.y, z = this.z;
		const e = m.elements;
		const w = 1 / ( e[ 3 ] * x + e[ 7 ] * y + e[ 11 ] * z + e[ 15 ] );
		this.x = ( e[ 0 ] * x + e[ 4 ] * y + e[ 8 ] * z + e[ 12 ] ) * w;
		this.y = ( e[ 1 ] * x + e[ 5 ] * y + e[ 9 ] * z + e[ 13 ] ) * w;
		this.z = ( e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z + e[ 14 ] ) * w;
		return this;
	}
	applyQuaternion( q ) {
		const x = this.x, y = this.y, z = this.z;
		const qx = q.x, qy = q.y, qz = q.z, qw = q.w;
		const ix = qw * x + qy * z - qz * y;
		const iy = qw * y + qz * x - qx * z;
		const iz = qw * z + qx * y - qy * x;
		const iw = - qx * x - qy * y - qz * z;
		this.x = ix * qw + iw * - qx + iy * - qz - iz * - qy;
		this.y = iy * qw + iw * - qy + iz * - qx - ix * - qz;
		this.z = iz * qw + iw * - qz + ix * - qy - iy * - qx;
		return this;
	}
	project( camera ) {
		return this.applyMatrix4( camera.matrixWorldInverse ).applyMatrix4( camera.projectionMatrix );
	}
	unproject( camera ) {
		return this.applyMatrix4( camera.projectionMatrixInverse ).applyMatrix4( camera.matrixWorld );
	}
	transformDirection( m ) {
		const x = this.x, y = this.y, z = this.z;
		const e = m.elements;
		this.x = e[ 0 ] * x + e[ 4 ] * y + e[ 8 ] * z;
		this.y = e[ 1 ] * x + e[ 5 ] * y + e[ 9 ] * z;
		this.z = e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z;
		return this.normalize();
	}
	divide( v ) {
		this.x /= v.x;
		this.y /= v.y;
		this.z /= v.z;
		return this;
	}
	divideScalar( scalar ) {
		return this.multiplyScalar( 1 / scalar );
	}
	min( v ) {
		this.x = Math.min( this.x, v.x );
		this.y = Math.min( this.y, v.y );
		this.z = Math.min( this.z, v.z );
		return this;
	}
	max( v ) {
		this.x = Math.max( this.x, v.x );
		this.y = Math.max( this.y, v.y );
		this.z = Math.max( this.z, v.z );
		return this;
	}
	clamp( min, max ) {
		this.x = Math.max( min.x, Math.min( max.x, this.x ) );
		this.y = Math.max( min.y, Math.min( max.y, this.y ) );
		this.z = Math.max( min.z, Math.min( max.z, this.z ) );
		return this;
	}
	clampScalar( minVal, maxVal ) {
		this.x = Math.max( minVal, Math.min( maxVal, this.x ) );
		this.y = Math.max( minVal, Math.min( maxVal, this.y ) );
		this.z = Math.max( minVal, Math.min( maxVal, this.z ) );
		return this;
	}
	clampLength( min, max ) {
		const length = this.length();
		return this.divideScalar( length || 1 ).multiplyScalar( Math.max( min, Math.min( max, length ) ) );
	}
	floor() {
		this.x = Math.floor( this.x );
		this.y = Math.floor( this.y );
		this.z = Math.floor( this.z );
		return this;
	}
	ceil() {
		this.x = Math.ceil( this.x );
		this.y = Math.ceil( this.y );
		this.z = Math.ceil( this.z );
		return this;
	}
	round() {
		this.x = Math.round( this.x );
		this.y = Math.round( this.y );
		this.z = Math.round( this.z );
		return this;
	}
	roundToZero() {
		this.x = ( this.x < 0 ) ? Math.ceil( this.x ) : Math.floor( this.x );
		this.y = ( this.y < 0 ) ? Math.ceil( this.y ) : Math.floor( this.y );
		this.z = ( this.z < 0 ) ? Math.ceil( this.z ) : Math.floor( this.z );
		return this;
	}
	negate() {
		this.x = - this.x;
		this.y = - this.y;
		this.z = - this.z;
		return this;
	}
	dot( v ) {
		return this.x * v.x + this.y * v.y + this.z * v.z;
	}
	lengthSq() {
		return this.x * this.x + this.y * this.y + this.z * this.z;
	}
	length() {
		return Math.sqrt( this.x * this.x + this.y * this.y + this.z * this.z );
	}
	manhattanLength() {
		return Math.abs( this.x ) + Math.abs( this.y ) + Math.abs( this.z );
	}
	normalize() {
		return this.divideScalar( this.length() || 1 );
	}
	setLength( length ) {
		return this.normalize().multiplyScalar( length );
	}
	lerp( v, alpha ) {
		this.x += ( v.x - this.x ) * alpha;
		this.y += ( v.y - this.y ) * alpha;
		this.z += ( v.z - this.z ) * alpha;
		return this;
	}
	lerpVectors( v1, v2, alpha ) {
		this.x = v1.x + ( v2.x - v1.x ) * alpha;
		this.y = v1.y + ( v2.y - v1.y ) * alpha;
		this.z = v1.z + ( v2.z - v1.z ) * alpha;
		return this;
	}
	cross( v, w ) {
		if ( w !== undefined ) {
			console.warn( 'THREE.Vector3: .cross() now only accepts one argument. Use .crossVectors( a, b ) instead.' );
			return this.crossVectors( v, w );
		}
		return this.crossVectors( this, v );
	}
	crossVectors( a, b ) {
		const ax = a.x, ay = a.y, az = a.z;
		const bx = b.x, by = b.y, bz = b.z;
		this.x = ay * bz - az * by;
		this.y = az * bx - ax * bz;
		this.z = ax * by - ay * bx;
		return this;
	}
	projectOnVector( v ) {
		const denominator = v.lengthSq();
		if ( denominator === 0 ) return this.set( 0, 0, 0 );
		const scalar = v.dot( this ) / denominator;
		return this.copy( v ).multiplyScalar( scalar );
	}
	projectOnPlane( planeNormal ) {
		_vector.copy( this ).projectOnVector( planeNormal );
		return this.sub( _vector );
	}
	reflect( normal ) {
		return this.sub( _vector.copy( normal ).multiplyScalar( 2 * this.dot( normal ) ) );
	}
	angleTo( v ) {
		const denominator = Math.sqrt( this.lengthSq() * v.lengthSq() );
		if ( denominator === 0 ) return Math.PI / 2;
		const theta = this.dot( v ) / denominator;
		return Math.acos( MathUtils.clamp( theta, - 1, 1 ) );
	}
	distanceTo( v ) {
		return Math.sqrt( this.distanceToSquared( v ) );
	}
	distanceToSquared( v ) {
		const dx = this.x - v.x, dy = this.y - v.y, dz = this.z - v.z;
		return dx * dx + dy * dy + dz * dz;
	}
	manhattanDistanceTo( v ) {
		return Math.abs( this.x - v.x ) + Math.abs( this.y - v.y ) + Math.abs( this.z - v.z );
	}
	setFromSpherical( s ) {
		return this.setFromSphericalCoords( s.radius, s.phi, s.theta );
	}
	setFromSphericalCoords( radius, phi, theta ) {
		const sinPhiRadius = Math.sin( phi ) * radius;
		this.x = sinPhiRadius * Math.sin( theta );
		this.y = Math.cos( phi ) * radius;
		this.z = sinPhiRadius * Math.cos( theta );
		return this;
	}
	setFromCylindrical( c ) {
		return this.setFromCylindricalCoords( c.radius, c.theta, c.y );
	}
	setFromCylindricalCoords( radius, theta, y ) {
		this.x = radius * Math.sin( theta );
		this.y = y;
		this.z = radius * Math.cos( theta );
		return this;
	}
	setFromMatrixPosition( m ) {
		const e = m.elements;
		this.x = e[ 12 ];
		this.y = e[ 13 ];
		this.z = e[ 14 ];
		return this;
	}
	setFromMatrixScale( m ) {
		const sx = this.setFromMatrixColumn( m, 0 ).length();
		const sy = this.setFromMatrixColumn( m, 1 ).length();
		const sz = this.setFromMatrixColumn( m, 2 ).length();
		this.x = sx;
		this.y = sy;
		this.z = sz;
		return this;
	}
	setFromMatrixColumn( m, index ) {
		return this.fromArray( m.elements, index * 4 );
	}
	setFromMatrix3Column( m, index ) {
		return this.fromArray( m.elements, index * 3 );
	}
	equals( v ) {
		return ( ( v.x === this.x ) && ( v.y === this.y ) && ( v.z === this.z ) );
	}
	fromArray( array, offset ) {
		if ( offset === undefined ) offset = 0;
		this.x = array[ offset ];
		this.y = array[ offset + 1 ];
		this.z = array[ offset + 2 ];
		return this;
	}
	toArray( array, offset ) {
		if ( array === undefined ) array = [];
		if ( offset === undefined ) offset = 0;
		array[ offset ] = this.x;
		array[ offset + 1 ] = this.y;
		array[ offset + 2 ] = this.z;
		return array;
	}
	fromBufferAttribute( attribute, index, offset ) {
		if ( offset !== undefined ) {
			console.warn( 'THREE.Vector3: offset has been removed from .fromBufferAttribute().' );
		}
		this.x = attribute.getX( index );
		this.y = attribute.getY( index );
		this.z = attribute.getZ( index );
		return this;
	}
	random() {
		this.x = Math.random();
		this.y = Math.random();
		this.z = Math.random();
		return this;
	}
}
const _vector = new Vector3();
const _quaternion$2 = new Quaternion();

class Matrix4 {
	constructor() {
		Object.defineProperty( this, 'isMatrix4', { value: true } );
		this.elements = [
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		];
		if ( arguments.length > 0 ) {
			console.error( 'THREE.Matrix4: the constructor no longer reads arguments. use .set() instead.' );
		}
	}
	set( n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44 ) {
		const te = this.elements;
		te[ 0 ] = n11; te[ 4 ] = n12; te[ 8 ] = n13; te[ 12 ] = n14;
		te[ 1 ] = n21; te[ 5 ] = n22; te[ 9 ] = n23; te[ 13 ] = n24;
		te[ 2 ] = n31; te[ 6 ] = n32; te[ 10 ] = n33; te[ 14 ] = n34;
		te[ 3 ] = n41; te[ 7 ] = n42; te[ 11 ] = n43; te[ 15 ] = n44;
		return this;
	}
	identity() {
		this.set(
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		);
		return this;
	}
	clone() {
		return new Matrix4().fromArray( this.elements );
	}
	copy( m ) {
		const te = this.elements;
		const me = m.elements;
		te[ 0 ] = me[ 0 ]; te[ 1 ] = me[ 1 ]; te[ 2 ] = me[ 2 ]; te[ 3 ] = me[ 3 ];
		te[ 4 ] = me[ 4 ]; te[ 5 ] = me[ 5 ]; te[ 6 ] = me[ 6 ]; te[ 7 ] = me[ 7 ];
		te[ 8 ] = me[ 8 ]; te[ 9 ] = me[ 9 ]; te[ 10 ] = me[ 10 ]; te[ 11 ] = me[ 11 ];
		te[ 12 ] = me[ 12 ]; te[ 13 ] = me[ 13 ]; te[ 14 ] = me[ 14 ]; te[ 15 ] = me[ 15 ];
		return this;
	}
	copyPosition( m ) {
		const te = this.elements, me = m.elements;
		te[ 12 ] = me[ 12 ];
		te[ 13 ] = me[ 13 ];
		te[ 14 ] = me[ 14 ];
		return this;
	}
	extractBasis( xAxis, yAxis, zAxis ) {
		xAxis.setFromMatrixColumn( this, 0 );
		yAxis.setFromMatrixColumn( this, 1 );
		zAxis.setFromMatrixColumn( this, 2 );
		return this;
	}
	makeBasis( xAxis, yAxis, zAxis ) {
		this.set(
			xAxis.x, yAxis.x, zAxis.x, 0,
			xAxis.y, yAxis.y, zAxis.y, 0,
			xAxis.z, yAxis.z, zAxis.z, 0,
			0, 0, 0, 1
		);
		return this;
	}
	extractRotation( m ) {
		const te = this.elements;
		const me = m.elements;
		const scaleX = 1 / _v1$1.setFromMatrixColumn( m, 0 ).length();
		const scaleY = 1 / _v1$1.setFromMatrixColumn( m, 1 ).length();
		const scaleZ = 1 / _v1$1.setFromMatrixColumn( m, 2 ).length();
		te[ 0 ] = me[ 0 ] * scaleX;
		te[ 1 ] = me[ 1 ] * scaleX;
		te[ 2 ] = me[ 2 ] * scaleX;
		te[ 3 ] = 0;
		te[ 4 ] = me[ 4 ] * scaleY;
		te[ 5 ] = me[ 5 ] * scaleY;
		te[ 6 ] = me[ 6 ] * scaleY;
		te[ 7 ] = 0;
		te[ 8 ] = me[ 8 ] * scaleZ;
		te[ 9 ] = me[ 9 ] * scaleZ;
		te[ 10 ] = me[ 10 ] * scaleZ;
		te[ 11 ] = 0;
		te[ 12 ] = 0;
		te[ 13 ] = 0;
		te[ 14 ] = 0;
		te[ 15 ] = 1;
		return this;
	}
	makeRotationFromEuler( euler ) {
		if ( ! ( euler && euler.isEuler ) ) {
			console.error( 'THREE.Matrix4: .makeRotationFromEuler() now expects a Euler rotation rather than a Vector3 and order.' );
		}
		const te = this.elements;
		const x = euler.x, y = euler.y, z = euler.z;
		const a = Math.cos( x ), b = Math.sin( x );
		const c = Math.cos( y ), d = Math.sin( y );
		const e = Math.cos( z ), f = Math.sin( z );
		if ( euler.order === 'XYZ' ) {
			const ae = a * e, af = a * f, be = b * e, bf = b * f;
			te[ 0 ] = c * e;
			te[ 4 ] = - c * f;
			te[ 8 ] = d;
			te[ 1 ] = af + be * d;
			te[ 5 ] = ae - bf * d;
			te[ 9 ] = - b * c;
			te[ 2 ] = bf - ae * d;
			te[ 6 ] = be + af * d;
			te[ 10 ] = a * c;
		} else if ( euler.order === 'YXZ' ) {
			const ce = c * e, cf = c * f, de = d * e, df = d * f;
			te[ 0 ] = ce + df * b;
			te[ 4 ] = de * b - cf;
			te[ 8 ] = a * d;
			te[ 1 ] = a * f;
			te[ 5 ] = a * e;
			te[ 9 ] = - b;
			te[ 2 ] = cf * b - de;
			te[ 6 ] = df + ce * b;
			te[ 10 ] = a * c;
		} else if ( euler.order === 'ZXY' ) {
			const ce = c * e, cf = c * f, de = d * e, df = d * f;
			te[ 0 ] = ce - df * b;
			te[ 4 ] = - a * f;
			te[ 8 ] = de + cf * b;
			te[ 1 ] = cf + de * b;
			te[ 5 ] = a * e;
			te[ 9 ] = df - ce * b;
			te[ 2 ] = - a * d;
			te[ 6 ] = b;
			te[ 10 ] = a * c;
		} else if ( euler.order === 'ZYX' ) {
			const ae = a * e, af = a * f, be = b * e, bf = b * f;
			te[ 0 ] = c * e;
			te[ 4 ] = be * d - af;
			te[ 8 ] = ae * d + bf;
			te[ 1 ] = c * f;
			te[ 5 ] = bf * d + ae;
			te[ 9 ] = af * d - be;
			te[ 2 ] = - d;
			te[ 6 ] = b * c;
			te[ 10 ] = a * c;
		} else if ( euler.order === 'YZX' ) {
			const ac = a * c, ad = a * d, bc = b * c, bd = b * d;
			te[ 0 ] = c * e;
			te[ 4 ] = bd - ac * f;
			te[ 8 ] = bc * f + ad;
			te[ 1 ] = f;
			te[ 5 ] = a * e;
			te[ 9 ] = - b * e;
			te[ 2 ] = - d * e;
			te[ 6 ] = ad * f + bc;
			te[ 10 ] = ac - bd * f;
		} else if ( euler.order === 'XZY' ) {
			const ac = a * c, ad = a * d, bc = b * c, bd = b * d;
			te[ 0 ] = c * e;
			te[ 4 ] = - f;
			te[ 8 ] = d * e;
			te[ 1 ] = ac * f + bd;
			te[ 5 ] = a * e;
			te[ 9 ] = ad * f - bc;
			te[ 2 ] = bc * f - ad;
			te[ 6 ] = b * e;
			te[ 10 ] = bd * f + ac;
		}
		te[ 3 ] = 0;
		te[ 7 ] = 0;
		te[ 11 ] = 0;
		te[ 12 ] = 0;
		te[ 13 ] = 0;
		te[ 14 ] = 0;
		te[ 15 ] = 1;
		return this;
	}
	makeRotationFromQuaternion( q ) {
		return this.compose( _zero, q, _one );
	}
	lookAt( eye, target, up ) {
		const te = this.elements;
		_z.subVectors( eye, target );
		if ( _z.lengthSq() === 0 ) {
			_z.z = 1;
		}
		_z.normalize();
		_x.crossVectors( up, _z );
		if ( _x.lengthSq() === 0 ) {
			if ( Math.abs( up.z ) === 1 ) {
				_z.x += 0.0001;
			} else {
				_z.z += 0.0001;
			}
			_z.normalize();
			_x.crossVectors( up, _z );
		}
		_x.normalize();
		_y.crossVectors( _z, _x );
		te[ 0 ] = _x.x; te[ 4 ] = _y.x; te[ 8 ] = _z.x;
		te[ 1 ] = _x.y; te[ 5 ] = _y.y; te[ 9 ] = _z.y;
		te[ 2 ] = _x.z; te[ 6 ] = _y.z; te[ 10 ] = _z.z;
		return this;
	}
	multiply( m, n ) {
		if ( n !== undefined ) {
			console.warn( 'THREE.Matrix4: .multiply() now only accepts one argument. Use .multiplyMatrices( a, b ) instead.' );
			return this.multiplyMatrices( m, n );
		}
		return this.multiplyMatrices( this, m );
	}
	premultiply( m ) {
		return this.multiplyMatrices( m, this );
	}
	multiplyMatrices( a, b ) {
		const ae = a.elements;
		const be = b.elements;
		const te = this.elements;
		const a11 = ae[ 0 ], a12 = ae[ 4 ], a13 = ae[ 8 ], a14 = ae[ 12 ];
		const a21 = ae[ 1 ], a22 = ae[ 5 ], a23 = ae[ 9 ], a24 = ae[ 13 ];
		const a31 = ae[ 2 ], a32 = ae[ 6 ], a33 = ae[ 10 ], a34 = ae[ 14 ];
		const a41 = ae[ 3 ], a42 = ae[ 7 ], a43 = ae[ 11 ], a44 = ae[ 15 ];
		const b11 = be[ 0 ], b12 = be[ 4 ], b13 = be[ 8 ], b14 = be[ 12 ];
		const b21 = be[ 1 ], b22 = be[ 5 ], b23 = be[ 9 ], b24 = be[ 13 ];
		const b31 = be[ 2 ], b32 = be[ 6 ], b33 = be[ 10 ], b34 = be[ 14 ];
		const b41 = be[ 3 ], b42 = be[ 7 ], b43 = be[ 11 ], b44 = be[ 15 ];
		te[ 0 ] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
		te[ 4 ] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
		te[ 8 ] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
		te[ 12 ] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;
		te[ 1 ] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
		te[ 5 ] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
		te[ 9 ] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
		te[ 13 ] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;
		te[ 2 ] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
		te[ 6 ] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
		te[ 10 ] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
		te[ 14 ] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;
		te[ 3 ] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
		te[ 7 ] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
		te[ 11 ] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
		te[ 15 ] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;
		return this;
	}
	multiplyScalar( s ) {
		const te = this.elements;
		te[ 0 ] *= s; te[ 4 ] *= s; te[ 8 ] *= s; te[ 12 ] *= s;
		te[ 1 ] *= s; te[ 5 ] *= s; te[ 9 ] *= s; te[ 13 ] *= s;
		te[ 2 ] *= s; te[ 6 ] *= s; te[ 10 ] *= s; te[ 14 ] *= s;
		te[ 3 ] *= s; te[ 7 ] *= s; te[ 11 ] *= s; te[ 15 ] *= s;
		return this;
	}
	determinant() {
		const te = this.elements;
		const n11 = te[ 0 ], n12 = te[ 4 ], n13 = te[ 8 ], n14 = te[ 12 ];
		const n21 = te[ 1 ], n22 = te[ 5 ], n23 = te[ 9 ], n24 = te[ 13 ];
		const n31 = te[ 2 ], n32 = te[ 6 ], n33 = te[ 10 ], n34 = te[ 14 ];
		const n41 = te[ 3 ], n42 = te[ 7 ], n43 = te[ 11 ], n44 = te[ 15 ];
		return (
			n41 * (
				+ n14 * n23 * n32
				 - n13 * n24 * n32
				 - n14 * n22 * n33
				 + n12 * n24 * n33
				 + n13 * n22 * n34
				 - n12 * n23 * n34
			) +
			n42 * (
				+ n11 * n23 * n34
				 - n11 * n24 * n33
				 + n14 * n21 * n33
				 - n13 * n21 * n34
				 + n13 * n24 * n31
				 - n14 * n23 * n31
			) +
			n43 * (
				+ n11 * n24 * n32
				 - n11 * n22 * n34
				 - n14 * n21 * n32
				 + n12 * n21 * n34
				 + n14 * n22 * n31
				 - n12 * n24 * n31
			) +
			n44 * (
				- n13 * n22 * n31
				 - n11 * n23 * n32
				 + n11 * n22 * n33
				 + n13 * n21 * n32
				 - n12 * n21 * n33
				 + n12 * n23 * n31
			)
		);
	}
	transpose() {
		const te = this.elements;
		let tmp;
		tmp = te[ 1 ]; te[ 1 ] = te[ 4 ]; te[ 4 ] = tmp;
		tmp = te[ 2 ]; te[ 2 ] = te[ 8 ]; te[ 8 ] = tmp;
		tmp = te[ 6 ]; te[ 6 ] = te[ 9 ]; te[ 9 ] = tmp;
		tmp = te[ 3 ]; te[ 3 ] = te[ 12 ]; te[ 12 ] = tmp;
		tmp = te[ 7 ]; te[ 7 ] = te[ 13 ]; te[ 13 ] = tmp;
		tmp = te[ 11 ]; te[ 11 ] = te[ 14 ]; te[ 14 ] = tmp;
		return this;
	}
	setPosition( x, y, z ) {
		const te = this.elements;
		if ( x.isVector3 ) {
			te[ 12 ] = x.x;
			te[ 13 ] = x.y;
			te[ 14 ] = x.z;
		} else {
			te[ 12 ] = x;
			te[ 13 ] = y;
			te[ 14 ] = z;
		}
		return this;
	}
	getInverse( m, throwOnDegenerate ) {
		if ( throwOnDegenerate !== undefined ) {
			console.warn( "THREE.Matrix4: .getInverse() can no longer be configured to throw on degenerate." );
		}
		const te = this.elements,
			me = m.elements,
			n11 = me[ 0 ], n21 = me[ 1 ], n31 = me[ 2 ], n41 = me[ 3 ],
			n12 = me[ 4 ], n22 = me[ 5 ], n32 = me[ 6 ], n42 = me[ 7 ],
			n13 = me[ 8 ], n23 = me[ 9 ], n33 = me[ 10 ], n43 = me[ 11 ],
			n14 = me[ 12 ], n24 = me[ 13 ], n34 = me[ 14 ], n44 = me[ 15 ],
			t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44,
			t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44,
			t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44,
			t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;
		const det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;
		if ( det === 0 ) return this.set( 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 );
		const detInv = 1 / det;
		te[ 0 ] = t11 * detInv;
		te[ 1 ] = ( n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44 ) * detInv;
		te[ 2 ] = ( n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44 ) * detInv;
		te[ 3 ] = ( n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43 ) * detInv;
		te[ 4 ] = t12 * detInv;
		te[ 5 ] = ( n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44 ) * detInv;
		te[ 6 ] = ( n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44 ) * detInv;
		te[ 7 ] = ( n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43 ) * detInv;
		te[ 8 ] = t13 * detInv;
		te[ 9 ] = ( n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44 ) * detInv;
		te[ 10 ] = ( n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44 ) * detInv;
		te[ 11 ] = ( n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43 ) * detInv;
		te[ 12 ] = t14 * detInv;
		te[ 13 ] = ( n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34 ) * detInv;
		te[ 14 ] = ( n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34 ) * detInv;
		te[ 15 ] = ( n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33 ) * detInv;
		return this;
	}
	scale( v ) {
		const te = this.elements;
		const x = v.x, y = v.y, z = v.z;
		te[ 0 ] *= x; te[ 4 ] *= y; te[ 8 ] *= z;
		te[ 1 ] *= x; te[ 5 ] *= y; te[ 9 ] *= z;
		te[ 2 ] *= x; te[ 6 ] *= y; te[ 10 ] *= z;
		te[ 3 ] *= x; te[ 7 ] *= y; te[ 11 ] *= z;
		return this;
	}
	getMaxScaleOnAxis() {
		const te = this.elements;
		const scaleXSq = te[ 0 ] * te[ 0 ] + te[ 1 ] * te[ 1 ] + te[ 2 ] * te[ 2 ];
		const scaleYSq = te[ 4 ] * te[ 4 ] + te[ 5 ] * te[ 5 ] + te[ 6 ] * te[ 6 ];
		const scaleZSq = te[ 8 ] * te[ 8 ] + te[ 9 ] * te[ 9 ] + te[ 10 ] * te[ 10 ];
		return Math.sqrt( Math.max( scaleXSq, scaleYSq, scaleZSq ) );
	}
	makeTranslation( x, y, z ) {
		this.set(
			1, 0, 0, x,
			0, 1, 0, y,
			0, 0, 1, z,
			0, 0, 0, 1
		);
		return this;
	}
	makeRotationX( theta ) {
		const c = Math.cos( theta ), s = Math.sin( theta );
		this.set(
			1, 0, 0, 0,
			0, c, - s, 0,
			0, s, c, 0,
			0, 0, 0, 1
		);
		return this;
	}
	makeRotationY( theta ) {
		const c = Math.cos( theta ), s = Math.sin( theta );
		this.set(
			 c, 0, s, 0,
			 0, 1, 0, 0,
			- s, 0, c, 0,
			 0, 0, 0, 1
		);
		return this;
	}
	makeRotationZ( theta ) {
		const c = Math.cos( theta ), s = Math.sin( theta );
		this.set(
			c, - s, 0, 0,
			s, c, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		);
		return this;
	}
	makeRotationAxis( axis, angle ) {
		const c = Math.cos( angle );
		const s = Math.sin( angle );
		const t = 1 - c;
		const x = axis.x, y = axis.y, z = axis.z;
		const tx = t * x, ty = t * y;
		this.set(
			tx * x + c, tx * y - s * z, tx * z + s * y, 0,
			tx * y + s * z, ty * y + c, ty * z - s * x, 0,
			tx * z - s * y, ty * z + s * x, t * z * z + c, 0,
			0, 0, 0, 1
		);
		return this;
	}
	makeScale( x, y, z ) {
		this.set(
			x, 0, 0, 0,
			0, y, 0, 0,
			0, 0, z, 0,
			0, 0, 0, 1
		);
		return this;
	}
	makeShear( x, y, z ) {
		this.set(
			1, y, z, 0,
			x, 1, z, 0,
			x, y, 1, 0,
			0, 0, 0, 1
		);
		return this;
	}
	compose( position, quaternion, scale ) {
		const te = this.elements;
		const x = quaternion._x, y = quaternion._y, z = quaternion._z, w = quaternion._w;
		const x2 = x + x,	y2 = y + y, z2 = z + z;
		const xx = x * x2, xy = x * y2, xz = x * z2;
		const yy = y * y2, yz = y * z2, zz = z * z2;
		const wx = w * x2, wy = w * y2, wz = w * z2;
		const sx = scale.x, sy = scale.y, sz = scale.z;
		te[ 0 ] = ( 1 - ( yy + zz ) ) * sx;
		te[ 1 ] = ( xy + wz ) * sx;
		te[ 2 ] = ( xz - wy ) * sx;
		te[ 3 ] = 0;
		te[ 4 ] = ( xy - wz ) * sy;
		te[ 5 ] = ( 1 - ( xx + zz ) ) * sy;
		te[ 6 ] = ( yz + wx ) * sy;
		te[ 7 ] = 0;
		te[ 8 ] = ( xz + wy ) * sz;
		te[ 9 ] = ( yz - wx ) * sz;
		te[ 10 ] = ( 1 - ( xx + yy ) ) * sz;
		te[ 11 ] = 0;
		te[ 12 ] = position.x;
		te[ 13 ] = position.y;
		te[ 14 ] = position.z;
		te[ 15 ] = 1;
		return this;
	}
	decompose( position, quaternion, scale ) {
		const te = this.elements;
		let sx = _v1$1.set( te[ 0 ], te[ 1 ], te[ 2 ] ).length();
		const sy = _v1$1.set( te[ 4 ], te[ 5 ], te[ 6 ] ).length();
		const sz = _v1$1.set( te[ 8 ], te[ 9 ], te[ 10 ] ).length();
		const det = this.determinant();
		if ( det < 0 ) sx = - sx;
		position.x = te[ 12 ];
		position.y = te[ 13 ];
		position.z = te[ 14 ];
		_m1$1.copy( this );
		const invSX = 1 / sx;
		const invSY = 1 / sy;
		const invSZ = 1 / sz;
		_m1$1.elements[ 0 ] *= invSX;
		_m1$1.elements[ 1 ] *= invSX;
		_m1$1.elements[ 2 ] *= invSX;
		_m1$1.elements[ 4 ] *= invSY;
		_m1$1.elements[ 5 ] *= invSY;
		_m1$1.elements[ 6 ] *= invSY;
		_m1$1.elements[ 8 ] *= invSZ;
		_m1$1.elements[ 9 ] *= invSZ;
		_m1$1.elements[ 10 ] *= invSZ;
		quaternion.setFromRotationMatrix( _m1$1 );
		scale.x = sx;
		scale.y = sy;
		scale.z = sz;
		return this;
	}
	makePerspective( left, right, top, bottom, near, far ) {
		if ( far === undefined ) {
			console.warn( 'THREE.Matrix4: .makePerspective() has been redefined and has a new signature. Please check the docs.' );
		}
		const te = this.elements;
		const x = 2 * near / ( right - left );
		const y = 2 * near / ( top - bottom );
		const a = ( right + left ) / ( right - left );
		const b = ( top + bottom ) / ( top - bottom );
		const c = - ( far + near ) / ( far - near );
		const d = - 2 * far * near / ( far - near );
		te[ 0 ] = x;	te[ 4 ] = 0;	te[ 8 ] = a;	te[ 12 ] = 0;
		te[ 1 ] = 0;	te[ 5 ] = y;	te[ 9 ] = b;	te[ 13 ] = 0;
		te[ 2 ] = 0;	te[ 6 ] = 0;	te[ 10 ] = c;	te[ 14 ] = d;
		te[ 3 ] = 0;	te[ 7 ] = 0;	te[ 11 ] = - 1;	te[ 15 ] = 0;
		return this;
	}
	makeOrthographic( left, right, top, bottom, near, far ) {
		const te = this.elements;
		const w = 1.0 / ( right - left );
		const h = 1.0 / ( top - bottom );
		const p = 1.0 / ( far - near );
		const x = ( right + left ) * w;
		const y = ( top + bottom ) * h;
		const z = ( far + near ) * p;
		te[ 0 ] = 2 * w;	te[ 4 ] = 0;	te[ 8 ] = 0;	te[ 12 ] = - x;
		te[ 1 ] = 0;	te[ 5 ] = 2 * h;	te[ 9 ] = 0;	te[ 13 ] = - y;
		te[ 2 ] = 0;	te[ 6 ] = 0;	te[ 10 ] = - 2 * p;	te[ 14 ] = - z;
		te[ 3 ] = 0;	te[ 7 ] = 0;	te[ 11 ] = 0;	te[ 15 ] = 1;
		return this;
	}
	equals( matrix ) {
		const te = this.elements;
		const me = matrix.elements;
		for ( let i = 0; i < 16; i ++ ) {
			if ( te[ i ] !== me[ i ] ) return false;
		}
		return true;
	}
	fromArray( array, offset ) {
		if ( offset === undefined ) offset = 0;
		for ( let i = 0; i < 16; i ++ ) {
			this.elements[ i ] = array[ i + offset ];
		}
		return this;
	}
	toArray( array, offset ) {
		if ( array === undefined ) array = [];
		if ( offset === undefined ) offset = 0;
		const te = this.elements;
		array[ offset ] = te[ 0 ];
		array[ offset + 1 ] = te[ 1 ];
		array[ offset + 2 ] = te[ 2 ];
		array[ offset + 3 ] = te[ 3 ];
		array[ offset + 4 ] = te[ 4 ];
		array[ offset + 5 ] = te[ 5 ];
		array[ offset + 6 ] = te[ 6 ];
		array[ offset + 7 ] = te[ 7 ];
		array[ offset + 8 ] = te[ 8 ];
		array[ offset + 9 ] = te[ 9 ];
		array[ offset + 10 ] = te[ 10 ];
		array[ offset + 11 ] = te[ 11 ];
		array[ offset + 12 ] = te[ 12 ];
		array[ offset + 13 ] = te[ 13 ];
		array[ offset + 14 ] = te[ 14 ];
		array[ offset + 15 ] = te[ 15 ];
		return array;
	}
}
const _v1$1 = new Vector3();
const _m1$1 = new Matrix4();
const _zero = new Vector3( 0, 0, 0 );
const _one = new Vector3( 1, 1, 1 );
const _x = new Vector3();
const _y = new Vector3();
const _z = new Vector3();

function EventDispatcher() {}
Object.assign( EventDispatcher.prototype, {
	addEventListener: function ( type, listener ) {
		if ( this._listeners === undefined ) this._listeners = {};
		const listeners = this._listeners;
		if ( listeners[ type ] === undefined ) {
			listeners[ type ] = [];
		}
		if ( listeners[ type ].indexOf( listener ) === - 1 ) {
			listeners[ type ].push( listener );
		}
	},
	hasEventListener: function ( type, listener ) {
		if ( this._listeners === undefined ) return false;
		const listeners = this._listeners;
		return listeners[ type ] !== undefined && listeners[ type ].indexOf( listener ) !== - 1;
	},
	removeEventListener: function ( type, listener ) {
		if ( this._listeners === undefined ) return;
		const listeners = this._listeners;
		const listenerArray = listeners[ type ];
		if ( listenerArray !== undefined ) {
			const index = listenerArray.indexOf( listener );
			if ( index !== - 1 ) {
				listenerArray.splice( index, 1 );
			}
		}
	},
	dispatchEvent: function ( event ) {
		if ( this._listeners === undefined ) return;
		const listeners = this._listeners;
		const listenerArray = listeners[ event.type ];
		if ( listenerArray !== undefined ) {
			event.target = this;
			const array = listenerArray.slice( 0 );
			for ( let i = 0, l = array.length; i < l; i ++ ) {
				array[ i ].call( this, event );
			}
		}
	}
} );

class Euler {
	constructor( x = 0, y = 0, z = 0, order = Euler.DefaultOrder ) {
		Object.defineProperty( this, 'isEuler', { value: true } );
		this._x = x;
		this._y = y;
		this._z = z;
		this._order = order;
	}
	get x() {
		return this._x;
	}
	set x( value ) {
		this._x = value;
		this._onChangeCallback();
	}
	get y() {
		return this._y;
	}
	set y( value ) {
		this._y = value;
		this._onChangeCallback();
	}
	get z() {
		return this._z;
	}
	set z( value ) {
		this._z = value;
		this._onChangeCallback();
	}
	get order() {
		return this._order;
	}
	set order( value ) {
		this._order = value;
		this._onChangeCallback();
	}
	set( x, y, z, order ) {
		this._x = x;
		this._y = y;
		this._z = z;
		this._order = order || this._order;
		this._onChangeCallback();
		return this;
	}
	clone() {
		return new this.constructor( this._x, this._y, this._z, this._order );
	}
	copy( euler ) {
		this._x = euler._x;
		this._y = euler._y;
		this._z = euler._z;
		this._order = euler._order;
		this._onChangeCallback();
		return this;
	}
	setFromRotationMatrix( m, order, update ) {
		const clamp = MathUtils.clamp;
		const te = m.elements;
		const m11 = te[ 0 ], m12 = te[ 4 ], m13 = te[ 8 ];
		const m21 = te[ 1 ], m22 = te[ 5 ], m23 = te[ 9 ];
		const m31 = te[ 2 ], m32 = te[ 6 ], m33 = te[ 10 ];
		order = order || this._order;
		switch ( order ) {
			case 'XYZ':
				this._y = Math.asin( clamp( m13, - 1, 1 ) );
				if ( Math.abs( m13 ) < 0.9999999 ) {
					this._x = Math.atan2( - m23, m33 );
					this._z = Math.atan2( - m12, m11 );
				} else {
					this._x = Math.atan2( m32, m22 );
					this._z = 0;
				}
				break;
			case 'YXZ':
				this._x = Math.asin( - clamp( m23, - 1, 1 ) );
				if ( Math.abs( m23 ) < 0.9999999 ) {
					this._y = Math.atan2( m13, m33 );
					this._z = Math.atan2( m21, m22 );
				} else {
					this._y = Math.atan2( - m31, m11 );
					this._z = 0;
				}
				break;
			case 'ZXY':
				this._x = Math.asin( clamp( m32, - 1, 1 ) );
				if ( Math.abs( m32 ) < 0.9999999 ) {
					this._y = Math.atan2( - m31, m33 );
					this._z = Math.atan2( - m12, m22 );
				} else {
					this._y = 0;
					this._z = Math.atan2( m21, m11 );
				}
				break;
			case 'ZYX':
				this._y = Math.asin( - clamp( m31, - 1, 1 ) );
				if ( Math.abs( m31 ) < 0.9999999 ) {
					this._x = Math.atan2( m32, m33 );
					this._z = Math.atan2( m21, m11 );
				} else {
					this._x = 0;
					this._z = Math.atan2( - m12, m22 );
				}
				break;
			case 'YZX':
				this._z = Math.asin( clamp( m21, - 1, 1 ) );
				if ( Math.abs( m21 ) < 0.9999999 ) {
					this._x = Math.atan2( - m23, m22 );
					this._y = Math.atan2( - m31, m11 );
				} else {
					this._x = 0;
					this._y = Math.atan2( m13, m33 );
				}
				break;
			case 'XZY':
				this._z = Math.asin( - clamp( m12, - 1, 1 ) );
				if ( Math.abs( m12 ) < 0.9999999 ) {
					this._x = Math.atan2( m32, m22 );
					this._y = Math.atan2( m13, m11 );
				} else {
					this._x = Math.atan2( - m23, m33 );
					this._y = 0;
				}
				break;
			default:
				console.warn( 'THREE.Euler: .setFromRotationMatrix() encountered an unknown order: ' + order );
		}
		this._order = order;
		if ( update !== false ) this._onChangeCallback();
		return this;
	}
	setFromQuaternion( q, order, update ) {
		_matrix.makeRotationFromQuaternion( q );
		return this.setFromRotationMatrix( _matrix, order, update );
	}
	setFromVector3( v, order ) {
		return this.set( v.x, v.y, v.z, order || this._order );
	}
	reorder( newOrder ) {
		_quaternion$1.setFromEuler( this );
		return this.setFromQuaternion( _quaternion$1, newOrder );
	}
	equals( euler ) {
		return ( euler._x === this._x ) && ( euler._y === this._y ) && ( euler._z === this._z ) && ( euler._order === this._order );
	}
	fromArray( array ) {
		this._x = array[ 0 ];
		this._y = array[ 1 ];
		this._z = array[ 2 ];
		if ( array[ 3 ] !== undefined ) this._order = array[ 3 ];
		this._onChangeCallback();
		return this;
	}
	toArray( array, offset ) {
		if ( array === undefined ) array = [];
		if ( offset === undefined ) offset = 0;
		array[ offset ] = this._x;
		array[ offset + 1 ] = this._y;
		array[ offset + 2 ] = this._z;
		array[ offset + 3 ] = this._order;
		return array;
	}
	toVector3( optionalResult ) {
		if ( optionalResult ) {
			return optionalResult.set( this._x, this._y, this._z );
		} else {
			return new Vector3( this._x, this._y, this._z );
		}
	}
	_onChange( callback ) {
		this._onChangeCallback = callback;
		return this;
	}
	_onChangeCallback() {}
}
Euler.DefaultOrder = 'XYZ';
Euler.RotationOrders = [ 'XYZ', 'YZX', 'ZXY', 'XZY', 'YXZ', 'ZYX' ];
const _matrix = new Matrix4();
const _quaternion$1 = new Quaternion();

class Layers {
	constructor() {
		this.mask = 1 | 0;
	}
	set( channel ) {
		this.mask = 1 << channel | 0;
	}
	enable( channel ) {
		this.mask |= 1 << channel | 0;
	}
	enableAll() {
		this.mask = 0xffffffff | 0;
	}
	toggle( channel ) {
		this.mask ^= 1 << channel | 0;
	}
	disable( channel ) {
		this.mask &= ~ ( 1 << channel | 0 );
	}
	disableAll() {
		this.mask = 0;
	}
	test( layers ) {
		return ( this.mask & layers.mask ) !== 0;
	}
}

class Matrix3 {
	constructor() {
		Object.defineProperty( this, 'isMatrix3', { value: true } );
		this.elements = [
			1, 0, 0,
			0, 1, 0,
			0, 0, 1
		];
		if ( arguments.length > 0 ) {
			console.error( 'THREE.Matrix3: the constructor no longer reads arguments. use .set() instead.' );
		}
	}
	set( n11, n12, n13, n21, n22, n23, n31, n32, n33 ) {
		const te = this.elements;
		te[ 0 ] = n11; te[ 1 ] = n21; te[ 2 ] = n31;
		te[ 3 ] = n12; te[ 4 ] = n22; te[ 5 ] = n32;
		te[ 6 ] = n13; te[ 7 ] = n23; te[ 8 ] = n33;
		return this;
	}
	identity() {
		this.set(
			1, 0, 0,
			0, 1, 0,
			0, 0, 1
		);
		return this;
	}
	clone() {
		return new this.constructor().fromArray( this.elements );
	}
	copy( m ) {
		const te = this.elements;
		const me = m.elements;
		te[ 0 ] = me[ 0 ]; te[ 1 ] = me[ 1 ]; te[ 2 ] = me[ 2 ];
		te[ 3 ] = me[ 3 ]; te[ 4 ] = me[ 4 ]; te[ 5 ] = me[ 5 ];
		te[ 6 ] = me[ 6 ]; te[ 7 ] = me[ 7 ]; te[ 8 ] = me[ 8 ];
		return this;
	}
	extractBasis( xAxis, yAxis, zAxis ) {
		xAxis.setFromMatrix3Column( this, 0 );
		yAxis.setFromMatrix3Column( this, 1 );
		zAxis.setFromMatrix3Column( this, 2 );
		return this;
	}
	setFromMatrix4( m ) {
		const me = m.elements;
		this.set(
			me[ 0 ], me[ 4 ], me[ 8 ],
			me[ 1 ], me[ 5 ], me[ 9 ],
			me[ 2 ], me[ 6 ], me[ 10 ]
		);
		return this;
	}
	multiply( m ) {
		return this.multiplyMatrices( this, m );
	}
	premultiply( m ) {
		return this.multiplyMatrices( m, this );
	}
	multiplyMatrices( a, b ) {
		const ae = a.elements;
		const be = b.elements;
		const te = this.elements;
		const a11 = ae[ 0 ], a12 = ae[ 3 ], a13 = ae[ 6 ];
		const a21 = ae[ 1 ], a22 = ae[ 4 ], a23 = ae[ 7 ];
		const a31 = ae[ 2 ], a32 = ae[ 5 ], a33 = ae[ 8 ];
		const b11 = be[ 0 ], b12 = be[ 3 ], b13 = be[ 6 ];
		const b21 = be[ 1 ], b22 = be[ 4 ], b23 = be[ 7 ];
		const b31 = be[ 2 ], b32 = be[ 5 ], b33 = be[ 8 ];
		te[ 0 ] = a11 * b11 + a12 * b21 + a13 * b31;
		te[ 3 ] = a11 * b12 + a12 * b22 + a13 * b32;
		te[ 6 ] = a11 * b13 + a12 * b23 + a13 * b33;
		te[ 1 ] = a21 * b11 + a22 * b21 + a23 * b31;
		te[ 4 ] = a21 * b12 + a22 * b22 + a23 * b32;
		te[ 7 ] = a21 * b13 + a22 * b23 + a23 * b33;
		te[ 2 ] = a31 * b11 + a32 * b21 + a33 * b31;
		te[ 5 ] = a31 * b12 + a32 * b22 + a33 * b32;
		te[ 8 ] = a31 * b13 + a32 * b23 + a33 * b33;
		return this;
	}
	multiplyScalar( s ) {
		const te = this.elements;
		te[ 0 ] *= s; te[ 3 ] *= s; te[ 6 ] *= s;
		te[ 1 ] *= s; te[ 4 ] *= s; te[ 7 ] *= s;
		te[ 2 ] *= s; te[ 5 ] *= s; te[ 8 ] *= s;
		return this;
	}
	determinant() {
		const te = this.elements;
		const a = te[ 0 ], b = te[ 1 ], c = te[ 2 ],
			d = te[ 3 ], e = te[ 4 ], f = te[ 5 ],
			g = te[ 6 ], h = te[ 7 ], i = te[ 8 ];
		return a * e * i - a * f * h - b * d * i + b * f * g + c * d * h - c * e * g;
	}
	getInverse( matrix, throwOnDegenerate ) {
		if ( throwOnDegenerate !== undefined ) {
			console.warn( "THREE.Matrix3: .getInverse() can no longer be configured to throw on degenerate." );
		}
		const me = matrix.elements,
			te = this.elements,
			n11 = me[ 0 ], n21 = me[ 1 ], n31 = me[ 2 ],
			n12 = me[ 3 ], n22 = me[ 4 ], n32 = me[ 5 ],
			n13 = me[ 6 ], n23 = me[ 7 ], n33 = me[ 8 ],
			t11 = n33 * n22 - n32 * n23,
			t12 = n32 * n13 - n33 * n12,
			t13 = n23 * n12 - n22 * n13,
			det = n11 * t11 + n21 * t12 + n31 * t13;
		if ( det === 0 ) return this.set( 0, 0, 0, 0, 0, 0, 0, 0, 0 );
		const detInv = 1 / det;
		te[ 0 ] = t11 * detInv;
		te[ 1 ] = ( n31 * n23 - n33 * n21 ) * detInv;
		te[ 2 ] = ( n32 * n21 - n31 * n22 ) * detInv;
		te[ 3 ] = t12 * detInv;
		te[ 4 ] = ( n33 * n11 - n31 * n13 ) * detInv;
		te[ 5 ] = ( n31 * n12 - n32 * n11 ) * detInv;
		te[ 6 ] = t13 * detInv;
		te[ 7 ] = ( n21 * n13 - n23 * n11 ) * detInv;
		te[ 8 ] = ( n22 * n11 - n21 * n12 ) * detInv;
		return this;
	}
	transpose() {
		let tmp;
		const m = this.elements;
		tmp = m[ 1 ]; m[ 1 ] = m[ 3 ]; m[ 3 ] = tmp;
		tmp = m[ 2 ]; m[ 2 ] = m[ 6 ]; m[ 6 ] = tmp;
		tmp = m[ 5 ]; m[ 5 ] = m[ 7 ]; m[ 7 ] = tmp;
		return this;
	}
	getNormalMatrix( matrix4 ) {
		return this.setFromMatrix4( matrix4 ).getInverse( this ).transpose();
	}
	transposeIntoArray( r ) {
		const m = this.elements;
		r[ 0 ] = m[ 0 ];
		r[ 1 ] = m[ 3 ];
		r[ 2 ] = m[ 6 ];
		r[ 3 ] = m[ 1 ];
		r[ 4 ] = m[ 4 ];
		r[ 5 ] = m[ 7 ];
		r[ 6 ] = m[ 2 ];
		r[ 7 ] = m[ 5 ];
		r[ 8 ] = m[ 8 ];
		return this;
	}
	setUvTransform( tx, ty, sx, sy, rotation, cx, cy ) {
		const c = Math.cos( rotation );
		const s = Math.sin( rotation );
		this.set(
			sx * c, sx * s, - sx * ( c * cx + s * cy ) + cx + tx,
			- sy * s, sy * c, - sy * ( - s * cx + c * cy ) + cy + ty,
			0, 0, 1
		);
	}
	scale( sx, sy ) {
		const te = this.elements;
		te[ 0 ] *= sx; te[ 3 ] *= sx; te[ 6 ] *= sx;
		te[ 1 ] *= sy; te[ 4 ] *= sy; te[ 7 ] *= sy;
		return this;
	}
	rotate( theta ) {
		const c = Math.cos( theta );
		const s = Math.sin( theta );
		const te = this.elements;
		const a11 = te[ 0 ], a12 = te[ 3 ], a13 = te[ 6 ];
		const a21 = te[ 1 ], a22 = te[ 4 ], a23 = te[ 7 ];
		te[ 0 ] = c * a11 + s * a21;
		te[ 3 ] = c * a12 + s * a22;
		te[ 6 ] = c * a13 + s * a23;
		te[ 1 ] = - s * a11 + c * a21;
		te[ 4 ] = - s * a12 + c * a22;
		te[ 7 ] = - s * a13 + c * a23;
		return this;
	}
	translate( tx, ty ) {
		const te = this.elements;
		te[ 0 ] += tx * te[ 2 ]; te[ 3 ] += tx * te[ 5 ]; te[ 6 ] += tx * te[ 8 ];
		te[ 1 ] += ty * te[ 2 ]; te[ 4 ] += ty * te[ 5 ]; te[ 7 ] += ty * te[ 8 ];
		return this;
	}
	equals( matrix ) {
		const te = this.elements;
		const me = matrix.elements;
		for ( let i = 0; i < 9; i ++ ) {
			if ( te[ i ] !== me[ i ] ) return false;
		}
		return true;
	}
	fromArray( array, offset ) {
		if ( offset === undefined ) offset = 0;
		for ( let i = 0; i < 9; i ++ ) {
			this.elements[ i ] = array[ i + offset ];
		}
		return this;
	}
	toArray( array, offset ) {
		if ( array === undefined ) array = [];
		if ( offset === undefined ) offset = 0;
		const te = this.elements;
		array[ offset ] = te[ 0 ];
		array[ offset + 1 ] = te[ 1 ];
		array[ offset + 2 ] = te[ 2 ];
		array[ offset + 3 ] = te[ 3 ];
		array[ offset + 4 ] = te[ 4 ];
		array[ offset + 5 ] = te[ 5 ];
		array[ offset + 6 ] = te[ 6 ];
		array[ offset + 7 ] = te[ 7 ];
		array[ offset + 8 ] = te[ 8 ];
		return array;
	}
}

let _object3DId = 0;
const _v1 = new Vector3();
const _q1 = new Quaternion();
const _m1 = new Matrix4();
const _target = new Vector3();
const _position = new Vector3();
const _scale = new Vector3();
const _quaternion = new Quaternion();
const _xAxis = new Vector3( 1, 0, 0 );
const _yAxis = new Vector3( 0, 1, 0 );
const _zAxis = new Vector3( 0, 0, 1 );
const _addedEvent = { type: 'added' };
const _removedEvent = { type: 'removed' };
function Object3D() {
	Object.defineProperty( this, 'id', { value: _object3DId ++ } );
	this.uuid = MathUtils.generateUUID();
	this.name = '';
	this.type = 'Object3D';
	this.parent = null;
	this.children = [];
	this.up = Object3D.DefaultUp.clone();
	const position = new Vector3();
	const rotation = new Euler();
	const quaternion = new Quaternion();
	const scale = new Vector3( 1, 1, 1 );
	function onRotationChange() {
		quaternion.setFromEuler( rotation, false );
	}
	function onQuaternionChange() {
		rotation.setFromQuaternion( quaternion, undefined, false );
	}
	rotation._onChange( onRotationChange );
	quaternion._onChange( onQuaternionChange );
	Object.defineProperties( this, {
		position: {
			configurable: true,
			enumerable: true,
			value: position
		},
		rotation: {
			configurable: true,
			enumerable: true,
			value: rotation
		},
		quaternion: {
			configurable: true,
			enumerable: true,
			value: quaternion
		},
		scale: {
			configurable: true,
			enumerable: true,
			value: scale
		},
		modelViewMatrix: {
			value: new Matrix4()
		},
		normalMatrix: {
			value: new Matrix3()
		}
	} );
	this.matrix = new Matrix4();
	this.matrixWorld = new Matrix4();
	this.matrixAutoUpdate = Object3D.DefaultMatrixAutoUpdate;
	this.matrixWorldNeedsUpdate = false;
	this.layers = new Layers();
	this.visible = true;
	this.castShadow = false;
	this.receiveShadow = false;
	this.frustumCulled = true;
	this.renderOrder = 0;
	this.userData = {};
}
Object3D.DefaultUp = new Vector3( 0, 1, 0 );
Object3D.DefaultMatrixAutoUpdate = true;
Object3D.prototype = Object.assign( Object.create( EventDispatcher.prototype ), {
	constructor: Object3D,
	isObject3D: true,
	onBeforeRender: function () {},
	onAfterRender: function () {},
	applyMatrix4: function ( matrix ) {
		if ( this.matrixAutoUpdate ) this.updateMatrix();
		this.matrix.premultiply( matrix );
		this.matrix.decompose( this.position, this.quaternion, this.scale );
	},
	applyQuaternion: function ( q ) {
		this.quaternion.premultiply( q );
		return this;
	},
	setRotationFromAxisAngle: function ( axis, angle ) {
		this.quaternion.setFromAxisAngle( axis, angle );
	},
	setRotationFromEuler: function ( euler ) {
		this.quaternion.setFromEuler( euler, true );
	},
	setRotationFromMatrix: function ( m ) {
		this.quaternion.setFromRotationMatrix( m );
	},
	setRotationFromQuaternion: function ( q ) {
		this.quaternion.copy( q );
	},
	rotateOnAxis: function ( axis, angle ) {
		_q1.setFromAxisAngle( axis, angle );
		this.quaternion.multiply( _q1 );
		return this;
	},
	rotateOnWorldAxis: function ( axis, angle ) {
		_q1.setFromAxisAngle( axis, angle );
		this.quaternion.premultiply( _q1 );
		return this;
	},
	rotateX: function ( angle ) {
		return this.rotateOnAxis( _xAxis, angle );
	},
	rotateY: function ( angle ) {
		return this.rotateOnAxis( _yAxis, angle );
	},
	rotateZ: function ( angle ) {
		return this.rotateOnAxis( _zAxis, angle );
	},
	translateOnAxis: function ( axis, distance ) {
		_v1.copy( axis ).applyQuaternion( this.quaternion );
		this.position.add( _v1.multiplyScalar( distance ) );
		return this;
	},
	translateX: function ( distance ) {
		return this.translateOnAxis( _xAxis, distance );
	},
	translateY: function ( distance ) {
		return this.translateOnAxis( _yAxis, distance );
	},
	translateZ: function ( distance ) {
		return this.translateOnAxis( _zAxis, distance );
	},
	localToWorld: function ( vector ) {
		return vector.applyMatrix4( this.matrixWorld );
	},
	worldToLocal: function ( vector ) {
		return vector.applyMatrix4( _m1.getInverse( this.matrixWorld ) );
	},
	lookAt: function ( x, y, z ) {
		if ( x.isVector3 ) {
			_target.copy( x );
		} else {
			_target.set( x, y, z );
		}
		const parent = this.parent;
		this.updateWorldMatrix( true, false );
		_position.setFromMatrixPosition( this.matrixWorld );
		if ( this.isCamera || this.isLight ) {
			_m1.lookAt( _position, _target, this.up );
		} else {
			_m1.lookAt( _target, _position, this.up );
		}
		this.quaternion.setFromRotationMatrix( _m1 );
		if ( parent ) {
			_m1.extractRotation( parent.matrixWorld );
			_q1.setFromRotationMatrix( _m1 );
			this.quaternion.premultiply( _q1.inverse() );
		}
	},
	add: function ( object ) {
		if ( arguments.length > 1 ) {
			for ( let i = 0; i < arguments.length; i ++ ) {
				this.add( arguments[ i ] );
			}
			return this;
		}
		if ( object === this ) {
			console.error( "THREE.Object3D.add: object can't be added as a child of itself.", object );
			return this;
		}
		if ( ( object && object.isObject3D ) ) {
			if ( object.parent !== null ) {
				object.parent.remove( object );
			}
			object.parent = this;
			this.children.push( object );
			object.dispatchEvent( _addedEvent );
		} else {
			console.error( "THREE.Object3D.add: object not an instance of THREE.Object3D.", object );
		}
		return this;
	},
	remove: function ( object ) {
		if ( arguments.length > 1 ) {
			for ( let i = 0; i < arguments.length; i ++ ) {
				this.remove( arguments[ i ] );
			}
			return this;
		}
		const index = this.children.indexOf( object );
		if ( index !== - 1 ) {
			object.parent = null;
			this.children.splice( index, 1 );
			object.dispatchEvent( _removedEvent );
		}
		return this;
	},
	attach: function ( object ) {
		this.updateWorldMatrix( true, false );
		_m1.getInverse( this.matrixWorld );
		if ( object.parent !== null ) {
			object.parent.updateWorldMatrix( true, false );
			_m1.multiply( object.parent.matrixWorld );
		}
		object.applyMatrix4( _m1 );
		object.updateWorldMatrix( false, false );
		this.add( object );
		return this;
	},
	getObjectById: function ( id ) {
		return this.getObjectByProperty( 'id', id );
	},
	getObjectByName: function ( name ) {
		return this.getObjectByProperty( 'name', name );
	},
	getObjectByProperty: function ( name, value ) {
		if ( this[ name ] === value ) return this;
		for ( let i = 0, l = this.children.length; i < l; i ++ ) {
			const child = this.children[ i ];
			const object = child.getObjectByProperty( name, value );
			if ( object !== undefined ) {
				return object;
			}
		}
		return undefined;
	},
	getWorldPosition: function ( target ) {
		if ( target === undefined ) {
			console.warn( 'THREE.Object3D: .getWorldPosition() target is now required' );
			target = new Vector3();
		}
		this.updateMatrixWorld( true );
		return target.setFromMatrixPosition( this.matrixWorld );
	},
	getWorldQuaternion: function ( target ) {
		if ( target === undefined ) {
			console.warn( 'THREE.Object3D: .getWorldQuaternion() target is now required' );
			target = new Quaternion();
		}
		this.updateMatrixWorld( true );
		this.matrixWorld.decompose( _position, target, _scale );
		return target;
	},
	getWorldScale: function ( target ) {
		if ( target === undefined ) {
			console.warn( 'THREE.Object3D: .getWorldScale() target is now required' );
			target = new Vector3();
		}
		this.updateMatrixWorld( true );
		this.matrixWorld.decompose( _position, _quaternion, target );
		return target;
	},
	getWorldDirection: function ( target ) {
		if ( target === undefined ) {
			console.warn( 'THREE.Object3D: .getWorldDirection() target is now required' );
			target = new Vector3();
		}
		this.updateMatrixWorld( true );
		const e = this.matrixWorld.elements;
		return target.set( e[ 8 ], e[ 9 ], e[ 10 ] ).normalize();
	},
	raycast: function () {},
	traverse: function ( callback ) {
		callback( this );
		const children = this.children;
		for ( let i = 0, l = children.length; i < l; i ++ ) {
			children[ i ].traverse( callback );
		}
	},
	traverseVisible: function ( callback ) {
		if ( this.visible === false ) return;
		callback( this );
		const children = this.children;
		for ( let i = 0, l = children.length; i < l; i ++ ) {
			children[ i ].traverseVisible( callback );
		}
	},
	traverseAncestors: function ( callback ) {
		const parent = this.parent;
		if ( parent !== null ) {
			callback( parent );
			parent.traverseAncestors( callback );
		}
	},
	updateMatrix: function () {
		this.matrix.compose( this.position, this.quaternion, this.scale );
		this.matrixWorldNeedsUpdate = true;
	},
	updateMatrixWorld: function ( force ) {
		if ( this.matrixAutoUpdate ) this.updateMatrix();
		if ( this.matrixWorldNeedsUpdate || force ) {
			if ( this.parent === null ) {
				this.matrixWorld.copy( this.matrix );
			} else {
				this.matrixWorld.multiplyMatrices( this.parent.matrixWorld, this.matrix );
			}
			this.matrixWorldNeedsUpdate = false;
			force = true;
		}
		const children = this.children;
		for ( let i = 0, l = children.length; i < l; i ++ ) {
			children[ i ].updateMatrixWorld( force );
		}
	},
	updateWorldMatrix: function ( updateParents, updateChildren ) {
		const parent = this.parent;
		if ( updateParents === true && parent !== null ) {
			parent.updateWorldMatrix( true, false );
		}
		if ( this.matrixAutoUpdate ) this.updateMatrix();
		if ( this.parent === null ) {
			this.matrixWorld.copy( this.matrix );
		} else {
			this.matrixWorld.multiplyMatrices( this.parent.matrixWorld, this.matrix );
		}
		if ( updateChildren === true ) {
			const children = this.children;
			for ( let i = 0, l = children.length; i < l; i ++ ) {
				children[ i ].updateWorldMatrix( false, true );
			}
		}
	},
	toJSON: function ( meta ) {
		const isRootObject = ( meta === undefined || typeof meta === 'string' );
		const output = {};
		if ( isRootObject ) {
			meta = {
				geometries: {},
				materials: {},
				textures: {},
				images: {},
				shapes: {}
			};
			output.metadata = {
				version: 4.5,
				type: 'Object',
				generator: 'Object3D.toJSON'
			};
		}
		const object = {};
		object.uuid = this.uuid;
		object.type = this.type;
		if ( this.name !== '' ) object.name = this.name;
		if ( this.castShadow === true ) object.castShadow = true;
		if ( this.receiveShadow === true ) object.receiveShadow = true;
		if ( this.visible === false ) object.visible = false;
		if ( this.frustumCulled === false ) object.frustumCulled = false;
		if ( this.renderOrder !== 0 ) object.renderOrder = this.renderOrder;
		if ( JSON.stringify( this.userData ) !== '{}' ) object.userData = this.userData;
		object.layers = this.layers.mask;
		object.matrix = this.matrix.toArray();
		if ( this.matrixAutoUpdate === false ) object.matrixAutoUpdate = false;
		if ( this.isInstancedMesh ) {
			object.type = 'InstancedMesh';
			object.count = this.count;
			object.instanceMatrix = this.instanceMatrix.toJSON();
		}
		function serialize( library, element ) {
			if ( library[ element.uuid ] === undefined ) {
				library[ element.uuid ] = element.toJSON( meta );
			}
			return element.uuid;
		}
		if ( this.isMesh || this.isLine || this.isPoints ) {
			object.geometry = serialize( meta.geometries, this.geometry );
			const parameters = this.geometry.parameters;
			if ( parameters !== undefined && parameters.shapes !== undefined ) {
				const shapes = parameters.shapes;
				if ( Array.isArray( shapes ) ) {
					for ( let i = 0, l = shapes.length; i < l; i ++ ) {
						const shape = shapes[ i ];
						serialize( meta.shapes, shape );
					}
				} else {
					serialize( meta.shapes, shapes );
				}
			}
		}
		if ( this.material !== undefined ) {
			if ( Array.isArray( this.material ) ) {
				const uuids = [];
				for ( let i = 0, l = this.material.length; i < l; i ++ ) {
					uuids.push( serialize( meta.materials, this.material[ i ] ) );
				}
				object.material = uuids;
			} else {
				object.material = serialize( meta.materials, this.material );
			}
		}
		if ( this.children.length > 0 ) {
			object.children = [];
			for ( let i = 0; i < this.children.length; i ++ ) {
				object.children.push( this.children[ i ].toJSON( meta ).object );
			}
		}
		if ( isRootObject ) {
			const geometries = extractFromCache( meta.geometries );
			const materials = extractFromCache( meta.materials );
			const textures = extractFromCache( meta.textures );
			const images = extractFromCache( meta.images );
			const shapes = extractFromCache( meta.shapes );
			if ( geometries.length > 0 ) output.geometries = geometries;
			if ( materials.length > 0 ) output.materials = materials;
			if ( textures.length > 0 ) output.textures = textures;
			if ( images.length > 0 ) output.images = images;
			if ( shapes.length > 0 ) output.shapes = shapes;
		}
		output.object = object;
		return output;
		function extractFromCache( cache ) {
			const values = [];
			for ( const key in cache ) {
				const data = cache[ key ];
				delete data.metadata;
				values.push( data );
			}
			return values;
		}
	},
	clone: function ( recursive ) {
		return new this.constructor().copy( this, recursive );
	},
	copy: function ( source, recursive ) {
		if ( recursive === undefined ) recursive = true;
		this.name = source.name;
		this.up.copy( source.up );
		this.position.copy( source.position );
		this.rotation.order = source.rotation.order;
		this.quaternion.copy( source.quaternion );
		this.scale.copy( source.scale );
		this.matrix.copy( source.matrix );
		this.matrixWorld.copy( source.matrixWorld );
		this.matrixAutoUpdate = source.matrixAutoUpdate;
		this.matrixWorldNeedsUpdate = source.matrixWorldNeedsUpdate;
		this.layers.mask = source.layers.mask;
		this.visible = source.visible;
		this.castShadow = source.castShadow;
		this.receiveShadow = source.receiveShadow;
		this.frustumCulled = source.frustumCulled;
		this.renderOrder = source.renderOrder;
		this.userData = JSON.parse( JSON.stringify( source.userData ) );
		if ( recursive === true ) {
			for ( let i = 0; i < source.children.length; i ++ ) {
				const child = source.children[ i ];
				this.add( child.clone() );
			}
		}
		return this;
	}
} );

export { Object3D };
