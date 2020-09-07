import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '../config/config.service';

const configService = new ConfigService();

const excelMimeTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/wps-office.xlsx',
    'application/vnd.ms-excel',
];

export const multerConfig = {
    dest: configService.get('UPLOAD_LOCATION'),
};

export const multerOptions = {
    fileFilter: (req: any, file: any, cb: any) => {
        const mimeType = excelMimeTypes.find(im => im === file.mimetype);

        if (mimeType) {
            cb(null, true);
        } else {
            cb(new HttpException(`Unsupported file type ${extname(file.originalname)}`, HttpStatus.BAD_REQUEST), false);
        }
    },
    storage: diskStorage({
        destination: (req: any, file: any, cb: any) => {
            const uploadPath = multerConfig.dest;
            if (!existsSync(uploadPath)) {
                mkdirSync(uploadPath);
            }
            cb(null, uploadPath);
        },
        filename: (req: any, file: any, cb: any) => {
            cb(null, file.originalname);
        },
    }),
};
