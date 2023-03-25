import type { JsonValue } from '../../util/index.js';
import { StringReader } from '../../util/index.js';
import type { DataInput, DataOutput } from '../io/index.js';
import type { NbtByte } from './NbtByte.js';
import type { NbtByteArray } from './NbtByteArray.js';
import type { NbtCompound } from './NbtCompound.js';
import type { NbtDouble } from './NbtDouble.js';
import type { NbtEnd } from './NbtEnd.js';
import type { NbtFloat } from './NbtFloat.js';
import type { NbtInt } from './NbtInt.js';
import type { NbtIntArray } from './NbtIntArray.js';
import type { NbtList } from './NbtList.js';
import type { NbtLong } from './NbtLong.js';
import type { NbtLongArray } from './NbtLongArray.js';
import type { NbtShort } from './NbtShort.js';
import type { NbtString } from './NbtString.js';
import { NbtType } from './NbtType.js';
interface NbtFactory {
    create(): NbtTag;
    fromString(reader: StringReader): NbtTag;
    fromJson(value: JsonValue): NbtTag;
    fromBytes(input: DataInput): NbtTag;
}
export declare abstract class NbtTag {
    private static readonly FACTORIES;
    static register(type: NbtType, factory: NbtFactory): void;
    isEnd(): this is NbtEnd;
    isByte(): this is NbtByte;
    isShort(): this is NbtShort;
    isInt(): this is NbtInt;
    isLong(): this is NbtLong;
    isFloat(): this is NbtFloat;
    isDouble(): this is NbtDouble;
    isByteArray(): this is NbtByteArray;
    isString(): this is NbtString;
    isList(): this is NbtList;
    isCompound(): this is NbtCompound;
    isIntArray(): this is NbtIntArray;
    isLongArray(): this is NbtLongArray;
    isNumber(): this is NbtByte | NbtShort | NbtInt | NbtLong | NbtFloat | NbtDouble;
    isArray(): this is NbtByteArray | NbtIntArray | NbtLongArray;
    isListOrArray(): this is NbtList | NbtByteArray | NbtIntArray | NbtLongArray;
    getAsNumber(): number;
    getAsString(): string;
    toJsonWithId(): JsonValue;
    abstract getId(): NbtType;
    abstract toString(): string;
    abstract toPrettyString(indent?: string, depth?: number): string;
    abstract toJson(): JsonValue;
    abstract toSimplifiedJson(): JsonValue;
    abstract toBytes(output: DataOutput): void;
    private static getFactory;
    static create(id: NbtType): NbtTag;
    static fromString(input: string | StringReader): NbtTag;
    static fromJson(value: JsonValue, id?: NbtType): NbtTag;
    static fromJsonWithId(value: JsonValue): NbtTag;
    static fromBytes(input: DataInput, id?: NbtType): NbtTag;
}
export {};
//# sourceMappingURL=NbtTag.d.ts.map