import * as fs from 'fs-extra';
import * as path from 'path';

/**
 * 유니코드 이스케이프 문자열을 한글로 변환하는 유틸리티
 */
class UnicodeConverter {
  /**
   * 유니코드 이스케이프 문자열을 실제 문자로 변환
   * @param text - 변환할 텍스트 (예: "\uD30C\uB780")
   * @returns 변환된 한글 문자열 (예: "파란")
   */
  static decodeUnicode(text: string): string {
    if (!text || typeof text !== 'string') {
      return text;
    }

    try {
      // JSON.parse를 사용하여 유니코드 이스케이프 문자열을 변환
      return JSON.parse(`"${text}"`);
    } catch (error) {
      // 변환 실패 시 원본 문자열 반환
      console.warn(`유니코드 변환 실패: ${text}`, error);
      return text;
    }
  }

  /**
   * WZ 데이터 객체의 모든 _value 필드를 변환
   * @param obj - 변환할 객체
   * @returns 변환된 객체
   */
  static convertWZObject(obj: unknown): unknown {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.convertWZObject(item));
    }

    const converted: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      if (key === '_value' && typeof value === 'string') {
        // _value 필드의 유니코드 문자열을 변환
        converted[key] = this.decodeUnicode(value);
      } else if (typeof value === 'object' && value !== null) {
        // 중첩된 객체도 재귀적으로 변환
        converted[key] = this.convertWZObject(value);
      } else {
        converted[key] = value;
      }
    }

    return converted;
  }

  /**
   * JSON 파일을 읽어서 유니코드를 변환한 후 새 파일로 저장
   * @param inputPath - 입력 파일 경로
   * @param outputPath - 출력 파일 경로 (선택사항, 없으면 .converted.json으로 저장)
   */
  static async convertJsonFile(inputPath: string, outputPath?: string): Promise<void> {
    try {
      console.log(`파일 변환 시작: ${inputPath}`);

      // JSON 파일 읽기
      const rawData = await fs.readJson(inputPath);

      // 유니코드 변환
      const convertedData = this.convertWZObject(rawData);

      // 출력 파일 경로 결정
      let finalOutputPath = outputPath;
      if (!finalOutputPath) {
        const parsedPath = path.parse(inputPath);
        finalOutputPath = path.join(
          parsedPath.dir,
          `${parsedPath.name}.converted${parsedPath.ext}`
        );
      }

      // 변환된 데이터 저장 (한글이 제대로 표시되도록 설정)
      await fs.writeJson(finalOutputPath, convertedData, {
        spaces: 2,
      });

      console.log(`변환 완료: ${finalOutputPath}`);

      // 변환 결과 요약
      const originalString = await fs.readFile(inputPath, 'utf8');
      const unicodeCount = (originalString.match(/\\u[0-9a-fA-F]{4}/g) || []).length;

      console.log(`변환된 유니코드 문자 수: ${unicodeCount}`);
    } catch (error) {
      console.error(`파일 변환 중 오류 발생: ${inputPath}`, error);
      throw error;
    }
  }

  /**
   * 디렉토리의 모든 JSON 파일을 변환
   * @param dirPath - 디렉토리 경로
   * @param pattern - 파일 패턴 (기본값: *.img.json)
   */
  static async convertDirectory(dirPath: string): Promise<void> {
    try {
      const files = await fs.readdir(dirPath);
      const jsonFiles = files.filter(file => file.endsWith('.img.json'));

      console.log(`${jsonFiles.length}개의 JSON 파일을 발견했습니다.`);

      for (const file of jsonFiles) {
        const inputPath = path.join(dirPath, file);
        await this.convertJsonFile(inputPath);
      }

      console.log('모든 파일 변환이 완료되었습니다.');
    } catch (error) {
      console.error('디렉토리 변환 중 오류 발생:', error);
      throw error;
    }
  }

  /**
   * 텍스트에서 유니코드 이스케이프 시퀀스를 찾아서 미리보기
   * @param text - 검사할 텍스트
   * @returns 변환 미리보기 결과
   */
  static previewConversion(text: string): {
    original: string;
    converted: string;
    hasUnicode: boolean;
  } {
    const hasUnicode = /\\u[0-9a-fA-F]{4}/.test(text);
    return {
      original: text,
      converted: hasUnicode ? this.decodeUnicode(text) : text,
      hasUnicode,
    };
  }
}

// CLI에서 직접 실행할 수 있도록
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('사용법:');
    console.log('  단일 파일 변환: npm run unicode <파일경로>');
    console.log('  디렉토리 변환: npm run unicode --dir <디렉토리경로>');
    console.log('  미리보기: npm run unicode --preview "<텍스트>"');
    console.log('');
    console.log('예제:');
    console.log('  npm run unicode string.wz/Etc.img.json');
    console.log('  npm run unicode --dir string.wz');
    console.log(
      '  npm run unicode --preview "\\uD30C\\uB780 \\uB2EC\\uD33D\\uC774\\uC758 \\uAECD\\uC9C8"'
    );
    return;
  }

  try {
    if (args[0] === '--preview') {
      if (args.length < 2) {
        console.log('미리보기 텍스트를 입력해주세요.');
        return;
      }
      const text = args[1];
      const result = UnicodeConverter.previewConversion(text);
      console.log('🔍 변환 미리보기:');
      console.log(`원본: ${result.original}`);
      console.log(`변환: ${result.converted}`);
      console.log(`유니코드 포함: ${result.hasUnicode ? 'Yes' : 'No'}`);
    } else if (args[0] === '--dir') {
      if (args.length < 2) {
        console.log('변환할 디렉토리 경로를 입력해주세요.');
        return;
      }
      const dirPath = args[1];
      await UnicodeConverter.convertDirectory(dirPath);
    } else {
      const inputPath = args[0];
      await UnicodeConverter.convertJsonFile(inputPath);
    }
  } catch (error) {
    console.error('변환 실패:', error);
    process.exit(1);
  }
}

// 직접 실행될 때만 main 함수 호출
if (require.main === module) {
  main().catch(console.error);
}

export { UnicodeConverter };
