import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  // Disimpan huruf kecil, jadi unik tanpa membedakan huruf besar-kecil
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  // select:false -> tidak pernah ikut terbaca kecuali diminta eksplisit (saat login)
  @Column({ type: 'varchar', length: 255, select: false })
  password_hash: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}

export type PublicUser = Omit<User, 'password_hash'>;
