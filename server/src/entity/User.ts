import {Entity, PrimaryGeneratedColumn, Column, BaseEntity} from "typeorm";
import {ObjectType, Field, Int} from "type-graphql";

@ObjectType()
@Entity("users")
export class User extends  BaseEntity{
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id: number;

    @Field()
    @Column('text')
    email: string;

    @Column('text') // It's usually infered so it can be blank as above
    password: string;

    @Column('int', {default: 0})
    tokenVersion: number;

}
